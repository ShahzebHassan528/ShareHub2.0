/**
 * Product API Layer
 * Handles all product-related API calls
 */

import apiClient from './client';

const productAPI = {
  /**
   * Get all products with filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Products data
   */
  getAllProducts: async (params = {}) => {
    const response = await apiClient.get('/v1/products', { params });
    return response.data;
  },

  /**
   * Get single product by ID
   * @param {number} id - Product ID
   * @returns {Promise} Product data
   */
  getProductById: async (id) => {
    const response = await apiClient.get(`/v1/products/${id}`);
    return response.data;
  },

  /**
   * Get nearby products
   * @param {Object} params - Location parameters
   * @returns {Promise} Nearby products
   */
  getNearbyProducts: async (params) => {
    const response = await apiClient.get('/v1/products/nearby', { params });
    return response.data;
  },

  /**
   * Get products by seller
   * @param {number} sellerId - Seller ID
   * @returns {Promise} Seller products
   */
  getProductsBySeller: async (sellerId) => {
    const response = await apiClient.get(`/v1/products/seller/${sellerId}`);
    return response.data;
  },

  /**
   * Create new product
   * @param {Object} productData - Product data
   * @returns {Promise} Created product
   */
  createProduct: async (productData) => {
    const response = await apiClient.post('/v1/products', productData);
    return response.data;
  },

  /**
   * Update product
   * @param {number} id - Product ID
   * @param {Object} productData - Updated data
   * @returns {Promise} Updated product
   */
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/v1/products/${id}`, productData);
    return response.data;
  },

  /**
   * Delete product
   * @param {number} id - Product ID
   * @returns {Promise} Delete confirmation
   */
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/v1/products/${id}`);
    return response.data;
  },

  /**
   * Get current user's products
   * @returns {Promise} User's products
   */
  getMyProducts: async () => {
    const response = await apiClient.get('/v1/products/my');
    return response;
  },

  /**
   * Toggle product status (active/inactive)
   * @param {number} id - Product ID
   * @returns {Promise} Updated product
   */
  toggleProductStatus: async (id) => {
    const response = await apiClient.put(`/v1/products/${id}/status`);
    return response;
  },
};

export default productAPI;
