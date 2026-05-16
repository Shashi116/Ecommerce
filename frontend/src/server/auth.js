import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import './env';
import { connectDB } from './db';
import User from './models/User';

export const AUTH_COOKIE = 'etreds_session';
const COOKIE_AGE_SECONDS = 30 * 24 * 60 * 60;

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export function signToken(id) {
  if (!process.env.JWT_SECRET) {
    throw new ApiError('JWT_SECRET must be defined in the environment.');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

export function publicUser(user) {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export function setAuthCookie(response, token) {
  response.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_AGE_SECONDS
  });
}

export function clearAuthCookie(response) {
  response.cookies.set({
    name: AUTH_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

export async function requireUser(request) {
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = request.cookies.get(AUTH_COOKIE)?.value || bearerToken;

  if (!token) {
    throw new ApiError('Not authorized, no token', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new ApiError('Not authorized, user not found', 401);
    }

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Not authorized, token failed', 401);
  }
}

export async function requireAdmin(request) {
  const user = await requireUser(request);

  if (user.role !== 'admin') {
    throw new ApiError('Not authorized as an admin', 401);
  }

  return user;
}

export function jsonError(error) {
  const status = error instanceof ApiError ? error.status : 500;
  const message = error?.message || 'Server error';
  return NextResponse.json({ message }, { status });
}
