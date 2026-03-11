/**
 * Admin API Layer
 */
import apiClient from './client';

const adminAPI = {
  // Users
  getAllUsers: (params = {}) => apiClient.get('/v1/admin/users', { params }),
  suspendUser: (id, reason) => apiClient.put(`/v1/admin/users/suspend/${id}`, { reason }),
  reactivateUser: (id) => apiClient.put(`/v1/admin/users/reactivate/${id}`),

  // Sellers
  getPendingSellers: () => apiClient.get('/v1/admin/sellers/pending'),
  getAllSellers: () => apiClient.get('/v1/admin/sellers/all'),
  approveSeller: (id) => apiClient.put(`/v1/admin/seller/approve/${id}`),
  rejectSeller: (id, reason) => apiClient.put(`/v1/admin/seller/reject/${id}`, { reason }),

  // NGOs
  getPendingNGOs: () => apiClient.get('/v1/admin/ngos/pending'),
  getApprovedNGOs: () => apiClient.get('/v1/admin/ngos/approved'),
  approveNGO: (id) => apiClient.put(`/v1/admin/ngo/approve/${id}`),
  rejectNGO: (id, reason) => apiClient.put(`/v1/admin/ngo/reject/${id}`, { reason }),

  // Products
  getAllProducts: () => apiClient.get('/v1/admin/products'),
  blockProduct: (id, reason) => apiClient.put(`/v1/admin/products/remove/${id}`, { reason }),
  unblockProduct: (id) => apiClient.put(`/v1/admin/products/unblock/${id}`),
};

export default adminAPI;