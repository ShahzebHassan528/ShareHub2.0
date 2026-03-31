import apiClient from './client';

// NOTE: apiClient interceptor already returns response.data — no .data needed.

export const getUserChats = async () => {
  const response = await apiClient.get('/v1/messages/chats');
  return response;
};

export const getConversation = async (userId, params = {}) => {
  const response = await apiClient.get(`/v1/messages/conversation/${userId}`, { params });
  return response;
};

export const sendMessage = async (receiverId, message) => {
  const response = await apiClient.post('/v1/messages/send', { receiver_id: receiverId, message });
  return response;
};

export const markAsRead = async (id) => {
  const response = await apiClient.put(`/v1/messages/read/${id}`);
  return response;
};

export const getUnreadCount = async () => {
  const response = await apiClient.get('/v1/messages/unread-count');
  return response;
};

export const deleteMessage = async (id) => {
  const response = await apiClient.delete(`/v1/messages/${id}`);
  return response;
};

export const searchMessages = async (q) => {
  const response = await apiClient.get('/v1/messages/search', { params: { q } });
  return response;
};
