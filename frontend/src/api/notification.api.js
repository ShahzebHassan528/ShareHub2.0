import apiClient from './client';

// NOTE: apiClient interceptor already returns response.data — no .data needed.

export const getNotifications = async (unreadOnly = false) => {
  const params = unreadOnly ? { unread: 'true' } : {};
  const response = await apiClient.get('/v1/notifications', { params });
  return response;
};

export const getUnreadCount = async () => {
  const response = await apiClient.get('/v1/notifications/unread-count');
  return response;
};

export const markAsRead = async (id) => {
  const response = await apiClient.put(`/v1/notifications/read/${id}`);
  return response;
};

export const markAllAsRead = async () => {
  const response = await apiClient.put('/v1/notifications/read-all');
  return response;
};
