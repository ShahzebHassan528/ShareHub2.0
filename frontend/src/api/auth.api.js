/**
 * Authentication API Endpoints
 * All auth-related API calls
 */

import apiClient from './client';

export const authAPI = {
  // Login
  login: async (credentials) => {
    return apiClient.post('/auth/signin', credentials);
  },

  // Register
  register: async (userData) => {
    return apiClient.post('/auth/signup', userData);
  },

  // Logout
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  // Get current user
  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },

  // Refresh token
  refreshToken: async () => {
    return apiClient.post('/auth/refresh');
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return apiClient.post('/auth/reset-password', { token, password });
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    return apiClient.post('/auth/change-password', { oldPassword, newPassword });
  },

  // Verify email
  verifyEmail: async (token) => {
    return apiClient.post('/auth/verify-email', { token });
  },
};

export default authAPI;
