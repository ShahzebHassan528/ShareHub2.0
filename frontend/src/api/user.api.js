import apiClient from './client';

/**
 * Get current user's profile
 */
export const getMyProfile = async () => {
  const response = await apiClient.get('/v1/users/profile');
  return response;
};

/**
 * Update current user's profile
 */
export const updateMyProfile = async (profileData) => {
  const response = await apiClient.put('/v1/users/profile', profileData);
  return response;
};

/**
 * Get public profile of any user
 */
export const getPublicProfile = async (userId) => {
  const response = await apiClient.get(`/v1/users/${userId}/public`);
  return response;
};
