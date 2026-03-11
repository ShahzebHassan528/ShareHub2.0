/**
 * User Service
 * Handles all user-related API calls
 */

import api from './api';

const userService = {
  /**
   * Get current user profile
   * @returns {Promise}
   */
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} userData 
   * @returns {Promise}
   */
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  /**
   * Change password
   * @param {string} currentPassword 
   * @param {string} newPassword 
   * @returns {Promise}
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Upload profile picture
   * @param {File} file 
   * @returns {Promise}
   */
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default userService;
