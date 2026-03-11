import apiClient from './client';

/**
 * Get available swap items for home page
 */
export const getAvailableSwaps = async (params = {}) => {
  const response = await apiClient.get('/swaps', { params });
  return response.data;
};

/**
 * Get user's own products for swap
 */
export const getMyProducts = async () => {
  const response = await apiClient.get('/products/my');
  return response.data;
};

/**
 * Create a swap request
 */
export const createSwapRequest = async (swapData) => {
  const response = await apiClient.post('/swaps', swapData);
  return response.data;
};

/**
 * Get swap requests made by current user
 */
export const getMySwapRequests = async () => {
  const response = await apiClient.get('/swaps/my/requests');
  return response.data;
};

/**
 * Get swap offers received by current user
 */
export const getMySwapOffers = async () => {
  const response = await apiClient.get('/swaps/my/offers');
  return response.data;
};

/**
 * Accept a swap request
 */
export const acceptSwap = async (swapId) => {
  const response = await apiClient.put(`/swaps/accept/${swapId}`);
  return response.data;
};

/**
 * Reject a swap request
 */
export const rejectSwap = async (swapId) => {
  const response = await apiClient.put(`/swaps/reject/${swapId}`);
  return response.data;
};

/**
 * Cancel a swap request
 */
export const cancelSwap = async (swapId) => {
  const response = await apiClient.put(`/swaps/cancel/${swapId}`);
  return response.data;
};

// Default export for convenience
const swapAPI = {
  getAvailableSwaps,
  getMyProducts,
  createSwapRequest,
  getMySwapRequests,
  getMySwapOffers,
  acceptSwap,
  rejectSwap,
  cancelSwap,
};

export default swapAPI;
