import apiClient from './client';

/**
 * Get list of verified NGOs
 */
export const getVerifiedNGOs = async () => {
  const response = await apiClient.get('/donations/ngos');
  return response.data;
};

/**
 * Create a donation request
 */
export const createDonationRequest = async (donationData) => {
  const response = await apiClient.post('/donations', donationData);
  return response.data;
};

/**
 * Get donations made by current user
 */
export const getMyDonations = async () => {
  const response = await apiClient.get('/donations/my');
  return response.data;
};

/**
 * Get donations for NGO
 */
export const getNGODonations = async () => {
  const response = await apiClient.get('/donations/ngo');
  return response.data;
};

/**
 * Accept a donation request (NGO only)
 */
export const acceptDonation = async (donationId) => {
  const response = await apiClient.put(`/donations/accept/${donationId}`);
  return response.data;
};

/**
 * Reject a donation request (NGO only)
 */
export const rejectDonation = async (donationId) => {
  const response = await apiClient.put(`/donations/reject/${donationId}`);
  return response.data;
};

// Default export for convenience
const donationAPI = {
  getVerifiedNGOs,
  createDonationRequest,
  getMyDonations,
  getNGODonations,
  acceptDonation,
  rejectDonation,
};

export default donationAPI;
