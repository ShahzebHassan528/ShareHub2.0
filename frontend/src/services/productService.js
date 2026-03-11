/**
 * Product Service
 * Handles all product-related API calls
 */

import api from './api';

const productService = {
  /**
   * Get all products with filters
   * @param {Object} filters 
   * @returns {Promise}
   */
  getAllProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/products?${params}`);
    return response.data;
  },

  /**
   * Get product by ID
   * @param {number} id 
   * @returns {Promise}
   */
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Get nearby products
   * @param {number} lat 
   * @param {number} lng 
   * @param {number} radius 
   * @returns {Promise}
   */
  getNearbyProducts: async (lat, lng, radius = 5) => {
    const response = await api.get(`/products/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
  },

  /**
   * Create new product
   * @param {Object} productData 
   * @returns {Promise}
   */
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  /**
   * Update product
   * @param {number} id 
   * @param {Object} productData 
   * @returns {Promise}
   */
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Delete product
   * @param {number} id 
   * @returns {Promise}
   */
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
