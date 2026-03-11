import apiClient from './client';

/**
 * Get all notifications for current user
 * @param {boolean} unreadOnly - Get only unread notifications
 */
export const getNotifications = async (unreadOnly = false) => {
  const params = unreadOnly ? { unread: 'true' } : {};
  const response = await apiClient.get('/notifications', { params });
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  const response = await apiClient.get('/notifications/unread-count');
  return response.data;
};

/**
 * Mark a notification as read
 * @param {number} id - Notification ID
 */
export const markAsRead = async (id) => {
  const response = await apiClient.put(`/notifications/read/${id}`);
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
  const response = await apiClient.put('/notifications/read-all');
  return response.data;
};
