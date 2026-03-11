/**
 * Order API Layer
 * Handles all order-related API calls
 */

import apiClient from './client';

const orderAPI = {
  /**
   * Create new order
   * @param {Object} orderData - Order data with items
   * @returns {Promise} Created order
   */
  createOrder: async (orderData) => {
    const response = await apiClient.post('/v1/orders', orderData);
    return response.data;
  },

  /**
   * Get my orders (buyer)
   * @returns {Promise} List of orders
   */
  getMyOrders: async () => {
    const response = await apiClient.get('/v1/orders');
    return response.data;
  },

  /**
   * Get seller orders
   * @returns {Promise} List of seller orders
   */
  getSellerOrders: async () => {
    const response = await apiClient.get('/v1/orders/seller');
    return response.data;
  },

  /**
   * Get order by ID
   * @param {number} id - Order ID
   * @returns {Promise} Order details
   */
  getOrderById: async (id) => {
    const response = await apiClient.get(`/v1/orders/${id}`);
    return response.data;
  },

  /**
   * Update order status
   * @param {number} id - Order ID
   * @param {string} status - New status
   * @returns {Promise} Updated order
   */
  updateOrderStatus: async (id, status) => {
    const response = await apiClient.put(`/v1/orders/${id}/status`, { status });
    return response.data;
  },

  /**
   * Cancel order
   * @param {number} id - Order ID
   * @returns {Promise} Cancelled order
   */
  cancelOrder: async (id) => {
    const response = await apiClient.put(`/v1/orders/${id}/cancel`);
    return response.data;
  },
};

export default orderAPI;
