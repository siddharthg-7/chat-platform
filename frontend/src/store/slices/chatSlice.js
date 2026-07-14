import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  loading: false,
  mutedConversations: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },

    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      state.typingUsers = [];
      // messages intentionally NOT cleared here — prevents the "erase" bug
    },

    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    addMessage: (state, action) => {
      const raw = action.payload;

      const normalized = raw.sender
        ? raw
        : {
            id: raw.message_id,
            conversation: raw.conversation_id ?? state.activeConversation,
            sender: { id: raw.sender_id, username: raw.sender_username || null },
            text: raw.text,
            attachment_url: raw.attachment_url || null,
            is_read: false,
            is_delivered: true,
            created_at: raw.created_at,
            temp_id: raw.temp_id || null,
            _ws: true,
          };

      const exists = state.messages.some((m) => m.id === normalized.id && !m._pending);
      if (exists) return;

      const pendingIdx = normalized._pending
        ? -1
        : state.messages.findIndex((m) => m._pending && m.id === normalized.temp_id);

      if (pendingIdx !== -1) {
        state.messages[pendingIdx] = { ...normalized, _pending: false };
      } else {
        state.messages.push(normalized);
      }

      const convIndex = state.conversations.findIndex(
        (c) => c.id === (normalized.conversation ?? state.activeConversation)
      );
      if (convIndex !== -1) {
        state.conversations[convIndex].last_message = normalized;
      }
    },

    confirmMessage: (state, action) => {
      const { temp_id, message_id, created_at } = action.payload;
      const idx = state.messages.findIndex((m) => m.id === temp_id);
      if (idx !== -1) {
        state.messages[idx] = {
          ...state.messages[idx],
          id: message_id,
          created_at,
          _pending: false,
        };
      }
    },

    updateConversationPreview: (state, action) => {
      const { conversationId, lastMessage, lastMessageTime } = action.payload;
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.last_message = { text: lastMessage, created_at: lastMessageTime };
      }
      state.conversations.sort(
        (a, b) => new Date(b.last_message?.created_at || 0) - new Date(a.last_message?.created_at || 0)
      );
    },

    removeConversation: (state, action) => {
      state.conversations = state.conversations.filter((c) => c.id !== action.payload);
      if (state.activeConversation === action.payload) {
        state.activeConversation = null;
        state.messages = [];
      }
    },

    toggleMuteConversation: (state, action) => {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) conv.is_muted = !conv.is_muted;
    },

    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter((id) => id !== action.payload);
    },

    updateMessageStatus: (state, action) => {
      const msg = state.messages.find((m) => m.id === action.payload.message_id);
      if (msg && action.payload.status === 'read') {
        msg.is_read = true;
      }
    },

    setTypingUser: (state, action) => {
      const userId = action.payload;
      if (!state.typingUsers.includes(userId)) {
        state.typingUsers.push(userId);
      }
    },
    clearTypingUser: (state, action) => {
      state.typingUsers = state.typingUsers.filter((id) => id !== action.payload);
    },

    // Muted conversations
    setMutedConversations: (state, action) => {
      state.mutedConversations = action.payload;
    },
    addMutedConversation: (state, action) => {
      if (!state.mutedConversations.includes(action.payload)) {
        state.mutedConversations.push(action.payload);
      }
    },
    removeMutedConversation: (state, action) => {
      state.mutedConversations = state.mutedConversations.filter(id => id !== action.payload);
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  setMessages,
  addMessage,
  confirmMessage,
  updateConversationPreview,
  removeConversation,
  toggleMuteConversation,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  updateMessageStatus,
  setTypingUser,
  clearTypingUser,
  addReaction,
  removeReaction,
  setMutedConversations,
  addMutedConversation,
  removeMutedConversation,
} = chatSlice.actions;

export default chatSlice.reducer;