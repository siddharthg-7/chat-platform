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

  getMessages: async (conversationId, cursorUrl = null) => {
    const url = cursorUrl || `/chat/messages/${conversationId}/`;
    const response = await api.get(url);
    const results = response.data.results ?? response.data;
    return {
      messages: [...results].reverse(),
      nextCursor: response.data.next || null
    };
  },

  sendMessage: async (conversationId, text = '', files = [], isVoiceNote = false) => {
    const formData = new FormData();
    formData.append('conversation_id', conversationId);
    if (text) formData.append('text', text);
    if (isVoiceNote) formData.append('is_voice_note', 'true');

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

  toggleReaction: async (messageId, emoji) => {
    const response = await api.post(`/chat/messages/${messageId}/react/`, { emoji });
    return response.data;
  },

  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}/`);
    return response.data;
  },

  updateGroup: async (groupId, name, avatarFile = null, coverFile = null) => {
    const formData = new FormData();
    if (name) formData.append('name', name);
    if (avatarFile) formData.append('avatar', avatarFile);
    if (coverFile) formData.append('cover', coverFile);
    
    const response = await api.patch(`/chat/group/${groupId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  groupMemberAction: async (groupId, userId, action) => {
    const response = await api.post(`/chat/group/${groupId}/members/`, { user_id: userId, action });
    return response.data;
  },

  leaveGroup: async (groupId) => {
    const response = await api.post(`/chat/group/${groupId}/leave/`);
    return response.data;
  },

  toggleStar: async (messageId) => {
    const response = await api.post(`/chat/messages/${messageId}/star/`);
    return response.data;
  },
};
