/**
 * Order Service
 * Handles all order-related API calls
 */

import api from './api.client';

const orderService = {
  /**
   * Create new order
   */
  create: (orderData) => {
    return api.post('/api/orders', orderData);
  },

  /**
   * Get user's orders
   */
  getMyOrders: () => {
    return api.get('/api/orders/myorders');
  },

  /**
   * Get all orders (admin only)
   */
  getAll: () => {
    return api.get('/api/orders');
  },

  /**
   * Update order status (admin only)
   */
  updateStatus: (orderId, status) => {
    return api.put(`/api/orders/${orderId}/status`, { status });
  },
};

export default orderService;
