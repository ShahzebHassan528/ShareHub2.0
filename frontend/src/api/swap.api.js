import apiClient from './client';

// NOTE: apiClient already returns response.data via interceptor — no .data needed.
// All routes prefixed with /v1/swaps to match backend route registration.

/**
 * Get available swap items
 */
export const getAvailableSwaps = async (params = {}) => {
  const response = await apiClient.get('/v1/swaps', { params });
  return response;
};

/**
 * Get user's own products for swap
 */
export const getMyProducts = async () => {
  const response = await apiClient.get('/v1/products/my');
  return response;
};

/**
 * Create a swap request
 */
export const createSwapRequest = async (swapData) => {
  const response = await apiClient.post('/v1/swaps', swapData);
  return response;
};

/**
 * Get swap requests SENT by current user
 * FIX: route is GET /sent, not GET /my/requests
 */
export const getMySwapRequests = async () => {
  const response = await apiClient.get('/v1/swaps/sent');
  return response;
};

/**
 * Get swap offers RECEIVED by current user
 * FIX: route is GET /received, not GET /my/offers
 */
export const getMySwapOffers = async () => {
  const response = await apiClient.get('/v1/swaps/received');
  return response;
};

/**
 * Accept a swap request
 * FIX: route is PUT /:id/accept, not PUT /accept/:id
 */
export const acceptSwap = async (swapId) => {
  const response = await apiClient.put(`/v1/swaps/${swapId}/accept`);
  return response;
};

/**
 * Reject a swap request
 * FIX: route is PUT /:id/reject, not PUT /reject/:id
 */
export const rejectSwap = async (swapId) => {
  const response = await apiClient.put(`/v1/swaps/${swapId}/reject`);
  return response;
};

/**
 * Cancel a swap request
 * FIX: route is PUT /:id/cancel, not PUT /cancel/:id
 */
export const cancelSwap = async (swapId) => {
  const response = await apiClient.put(`/v1/swaps/${swapId}/cancel`);
  return response;
};

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
