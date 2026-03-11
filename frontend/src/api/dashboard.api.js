/**
 * Dashboard API Layer
 * Handles all dashboard-related API calls
 */

import apiClient from './client';

const dashboardAPI = {
  /**
   * Get admin dashboard statistics
   * @returns {Promise} Admin stats data
   */
  getAdminStats: async () => {
    const response = await apiClient.get('/v1/dashboard/stats');
    return response;
  },

  getSellerStats: async () => {
    const response = await apiClient.get('/v1/dashboard/seller-stats');
    return response;
  },

  getBuyerStats: async () => {
    const response = await apiClient.get('/v1/dashboard/buyer-stats');
    return response;
  },

  getNGOStats: async () => {
    const response = await apiClient.get('/v1/dashboard/ngo-stats');
    return response;
  },
};

export default dashboardAPI;