import apiClient from './client';

// NOTE: apiClient already returns response.data via interceptor — no .data needed here.
// All routes prefixed with /v1/donations to match backend route registration.

/**
 * Get list of verified NGOs
 */
export const getVerifiedNGOs = async () => {
  const response = await apiClient.get('/v1/donations/ngos');
  return response;
};

/**
 * Create a donation request
 */
export const createDonationRequest = async (donationData) => {
  const response = await apiClient.post('/v1/donations', donationData);
  return response;
};

/**
 * Get donations made by current user
 */
export const getMyDonations = async () => {
  const response = await apiClient.get('/v1/donations/my');
  return response;
};

/**
 * Get donations for NGO
 */
export const getNGODonations = async () => {
  const response = await apiClient.get('/v1/donations/ngo');
  return response;
};

/**
 * Accept a donation request (NGO only)
 * FIX: route is PUT /:id/accept, not PUT /accept/:id
 */
export const acceptDonation = async (donationId) => {
  const response = await apiClient.put(`/v1/donations/${donationId}/accept`);
  return response;
};

/**
 * Reject a donation request (NGO only)
 * FIX: route is PUT /:id/reject, not PUT /reject/:id
 */
export const rejectDonation = async (donationId) => {
  const response = await apiClient.put(`/v1/donations/${donationId}/reject`);
  return response;
};

const donationAPI = {
  getVerifiedNGOs,
  createDonationRequest,
  getMyDonations,
  getNGODonations,
  acceptDonation,
  rejectDonation,
};

export default donationAPI;
