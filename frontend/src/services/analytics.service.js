/**
 * Analytics Service
 * Handles all analytics-related API calls (admin only)
 */

import api from './api.client';

const analyticsService = {
  /**
   * Get admin dashboard stats
   */
  getStats: () => {
    return api.get('/api/analytics');
  },
};

export default analyticsService;
