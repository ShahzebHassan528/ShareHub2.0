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
 * Upload profile avatar image
 * @param {FormData} formData - FormData with 'profile_avatar' file
 */
export const uploadProfileImage = async (formData) => {
  const response = await apiClient.post('/v1/upload/profile-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response;
};

/**
 * Get public profile of any user
 */
export const getPublicProfile = async (userId) => {
  const response = await apiClient.get(`/v1/users/${userId}/public`);
  return response;
};
