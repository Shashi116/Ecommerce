import nodemailer from 'nodemailer';
import './env';

export default async function sendEmail({ email, subject, message }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn('Skipping email: GMAIL_USER or GMAIL_PASS is missing.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Saha Traditions Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html: message
    });
  } catch (error) {
    console.error(`Failed to send email to ${email}: ${error.message}`);
  }
}
