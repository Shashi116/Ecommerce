/**
 * Product Service
 * Handles all product-related API calls
 */

import api from './api.client';

const productService = {
  /**
   * Get all products
   */
  getAll: () => {
    return api.get('/api/products');
  },

  /**
   * Get product by ID
   */
  getById: (id) => {
    return api.get(`/api/products/${id}`);
  },

  /**
   * Create new product (admin only)
   */
  create: (formData) => {
    return api.upload('/api/products', formData);
  },

  /**
   * Update product (admin only)
   */
  update: (id, formData) => {
    return api.upload(`/api/products/${id}`, formData);
  },

  /**
   * Delete product (admin only)
   */
  delete: (id) => {
    return api.delete(`/api/products/${id}`);
  },
};

export default productService;
