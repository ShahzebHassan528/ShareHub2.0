/**
 * Product API Layer
 * Handles all product-related API calls
 */

import apiClient from './client';

// NOTE: apiClient (client.js) interceptor already returns response.data directly.
// So we return the response as-is — no .data needed here.

const productAPI = {
  getAllProducts: async (params = {}) => {
    const response = await apiClient.get('/v1/products', { params });
    return response;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/v1/products/${id}`);
    return response;
  },

  getNearbyProducts: async (params) => {
    const response = await apiClient.get('/v1/products/nearby', { params });
    return response;
  },

  getProductsBySeller: async (sellerId) => {
    const response = await apiClient.get(`/v1/products/seller/${sellerId}`);
    return response;
  },

  createProduct: async (productData) => {
    const response = await apiClient.post('/v1/products', productData);
    return response;
  },

  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/v1/products/${id}`, productData);
    return response;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/v1/products/${id}`);
    return response;
  },

  getMyProducts: async () => {
    const response = await apiClient.get('/v1/products/my');
    return response;
  },

  toggleProductStatus: async (id) => {
    const response = await apiClient.put(`/v1/products/${id}/status`);
    return response;
  },
};

export default productAPI;
