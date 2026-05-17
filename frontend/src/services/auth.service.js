/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import api from './api.client';

const authService = {
  /**
   * Register user with email and password
   */
  register: (name, email, password) => {
    return api.post('/api/auth/register', { name, email, password });
  },

  /**
   * Verify OTP for email confirmation
   */
  verifyOtp: (email, otp) => {
    return api.post('/api/auth/verify-otp', { email, otp });
  },

  /**
   * Login with email and password
   */
  login: (email, password) => {
    return api.post('/api/auth/login', { email, password });
  },

  /**
   * Login or create user via Firebase (Google OAuth)
   * Send Firebase ID token to backend
   */
  loginWithFirebase: (firebaseToken, user) => {
    return api.post('/api/auth/firebase-login', {
      token: firebaseToken,
      email: user.email,
      name: user.displayName || 'User',
    });
  },

  /**
   * Get current user profile
   */
  getMe: () => {
    return api.get('/api/auth/me');
  },

  /**
   * Get all users (admin only)
   */
  getUsers: () => {
    return api.get('/api/auth/users');
  },

  /**
   * Logout
   */
  logout: () => {
    return api.post('/api/auth/logout', {});
  },
};

export default authService;
