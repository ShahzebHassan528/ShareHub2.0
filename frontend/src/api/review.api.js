import apiClient from './client';

// NOTE: apiClient interceptor already returns response.data — no .data needed.

const reviewAPI = {
  getProductReviews: async (productId) => {
    const response = await apiClient.get(`/v1/reviews/product/${productId}`);
    return response;
  },

  createReview: async (productId, reviewData) => {
    const response = await apiClient.post(`/v1/reviews/product/${productId}`, reviewData);
    return response;
  },

  deleteReview: async (reviewId) => {
    const response = await apiClient.delete(`/v1/reviews/${reviewId}`);
    return response;
  },
};

export default reviewAPI;
