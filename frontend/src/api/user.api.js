import apiClient from './client';

/**
 * Get current user's profile
 */
export const getMyProfile = async () => {
  const response = await apiClient.get('/users/profile');
  return response.data;
};

/**
 * Update current user's profile
 */
export const updateMyProfile = async (profileData) => {
  const response = await apiClient.put('/users/profile', profileData);
  return response.data;
};

/**
 * Get public profile of any user
 */
export const getPublicProfile = async (userId) => {
  const response = await apiClient.get(`/users/${userId}/public`);
  return response.data;
};
