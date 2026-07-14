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

  createGroup: async ({ name, member_ids }) => {
    const response = await api.post('/chat/conversations/group/', { name, member_ids });
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(`/chat/messages/${conversationId}/`);
    return response.data.results ?? response.data;
  },

  sendMessage: async (conversationId, text = '', files = []) => {
    const formData = new FormData();
    formData.append('conversation_id', conversationId);
    if (text) formData.append('text', text);

    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post('/chat/send/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get('/accounts/users/search/', { params: { q: query } });
    return response.data;
  },

  toggleMute: async (conversationId) => {
    const response = await api.patch(`/chat/conversations/${conversationId}/mute/`);
    return response.data;
  },

  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}/`);
    return response.data;
  },
};