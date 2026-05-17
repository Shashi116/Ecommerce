/**
 * Payment Service
 * Handles all payment-related API calls
 */

import api from './api.client';

const paymentService = {
  /**
   * Get Razorpay API key
   */
  getKey: () => {
    return api.get('/api/payment/key');
  },

  /**
   * Create payment order
   */
  createOrder: (amount) => {
    return api.post('/api/payment/order', { amount });
  },

  /**
   * Verify payment
   */
  verify: (paymentData) => {
    return api.post('/api/payment/verify', paymentData);
  },
};

export default paymentService;
