/**
 * Order Service
 * Handles all order-related API calls
 */

import api from './api';

const orderService = {
  /**
   * Get all orders for current user
   * @returns {Promise}
   */
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  /**
   * Get order by ID
   * @param {number} id 
   * @returns {Promise}
   */
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Create new order
   * @param {Object} orderData 
   * @returns {Promise}
   */
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Update order status
   * @param {number} id 
   * @param {string} status 
   * @returns {Promise}
   */
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  /**
   * Cancel order
   * @param {number} id 
   * @returns {Promise}
   */
  cancelOrder: async (id) => {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },
};

export default orderService;
