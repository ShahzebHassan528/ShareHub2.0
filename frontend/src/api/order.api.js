/**
 * Order API Layer
 * Handles all order-related API calls
 */

import apiClient from './client';

// NOTE: apiClient (client.js) interceptor already returns response.data directly.
// So we return the response as-is — no .data needed here.

const orderAPI = {
  createOrder: async (orderData) => {
    const response = await apiClient.post('/v1/orders', orderData);
    return response;
  },

  getMyOrders: async () => {
    const response = await apiClient.get('/v1/orders');
    return response;
  },

  getSellerOrders: async () => {
    const response = await apiClient.get('/v1/orders/seller');
    return response;
  },

  getOrderById: async (id) => {
    const response = await apiClient.get(`/v1/orders/${id}`);
    return response;
  },

  updateOrderStatus: async (id, status) => {
    const response = await apiClient.put(`/v1/orders/${id}/status`, { status });
    return response;
  },

  cancelOrder: async (id) => {
    const response = await apiClient.put(`/v1/orders/${id}/cancel`);
    return response;
  },
};

export default orderAPI;
