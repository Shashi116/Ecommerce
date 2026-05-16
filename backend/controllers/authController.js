const { prisma } = require('../config/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async ({ name, email, otp }) => {
  const message = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
      
      <h2 style="color: #333;">Welcome to Saha Traditions, ${name} 👋</h2>
      
      <p style="color: #555; font-size: 14px;">
        Thank you for signing up with <strong>Saha Traditions</strong>.  
        To complete your account verification, please use the One-Time Password (OTP) below:
      </p>

      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #2d89ef;">
          ${otp}
        </span>
      </div>

      <p style="color: #555; font-size: 13px;">
        This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

      <p style="color: #999; font-size: 12px;">
        If you did not request this, you can safely ignore this email.
      </p>

      <p style="color: #999; font-size: 12px;">
        — Team Saha Traditions
      </p>

    </div>
  </div>
`;

  await sendEmail({
    email,
    subject: 'Saha Traditions - Verify your account',
    message
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, salt);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update or create user
    if (userExists && !userExists.isVerified) {
      await prisma.user.update({
        where: { email },
        data: {
          name,
          password: passwordHash,
          otpHash,
          otpExpiresAt,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          otpHash,
          otpExpiresAt,
          isVerified: false,
        },
      });
    }

    await sendOtpEmail({ name, email, otp });

    return res.status(201).json({
      message: 'OTP sent to email. Please verify to continue.',
      email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified.' });
    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP not requested. Please register again.' });
    }
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please register again.' });
    }

    const isMatch = await bcrypt.compare(otp.toString(), user.otpHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP.' });

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otpHash: null,
        otpExpiresAt: null,
      },
    });

    return res.json({ message: 'Account verified. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your account before logging in.' });
      }

      const token = generateToken(user.id);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      };

      res.cookie('authToken', token, cookieOptions);

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, verifyOtp, loginUser, getUsers, getMe, logout };
