import api from './api';

export const chatService = {
  getConversations: async () => {
    const response = await api.get('/chat/conversations/');
    return response.data.results ?? response.data;
  },

  createConversation: async (userId) => {
    const response = await api.post('/chat/conversations/', { user_id: userId });
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(`/chat/messages/${conversationId}/`);
    return response.data.results ?? response.data;
  },

  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}/`);
    return response.status === 204;
  },

  sendMessage: async (conversationId, text = '', files = []) => {
    const formData = new FormData();
    formData.append('conversation', conversationId);
    if (text) formData.append('text', text);
    
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post('/chat/send/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get('/accounts/users/search/', { params: { q: query } });
    return response.data;
  },

  addReaction: async (messageId, emoji) => {
    const response = await api.post(`/chat/messages/${messageId}/reactions/`, { emoji });
    return response.data;
  },

  removeReaction: async (messageId, emoji) => {
    const response = await api.delete(`/chat/messages/${messageId}/reactions/`, { data: { emoji } });
    return response.data;
  },

  getMutedConversations: async () => {
    const response = await api.get('/chat/muted/');
    return response.data.muted || [];
  },

  muteConversation: async (conversationId) => {
    const response = await api.post('/chat/muted/', { conversation_id: conversationId });
    return response.data;
  },

  unmuteConversation: async (conversationId) => {
    const response = await api.delete('/chat/muted/', { data: { conversation_id: conversationId } });
    return response.status === 204;
  },

  getUser: async (userId) => {
    const response = await api.get(`/accounts/users/${userId}/`);
    return response.data;
  },
};