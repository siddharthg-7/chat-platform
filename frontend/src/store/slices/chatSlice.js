import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],   // user IDs currently typing in active conversation
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
      // Clear messages and typing when switching conversations
      state.messages = [];
      state.typingUsers = [];
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    /**
     * Handles both:
     *  - REST format:  { id, conversation, sender: { id, username, ... }, text, is_read, created_at }
     *  - WS format:    { action:'receive_message', message_id, sender_id, text, created_at }
     * Normalises to REST format so components only deal with one shape.
     */
    addMessage: (state, action) => {
      const raw = action.payload;

      // WS receive_message format → normalise to REST-like shape
      const normalized = raw.sender
        ? raw  // Already REST shape (from API)
        : {
            id: raw.message_id,
            conversation: state.activeConversation,
            sender: { id: raw.sender_id, username: null }, // username filled on render via onlineUsers
            text: raw.text,
            is_read: false,
            is_delivered: true,
            created_at: raw.created_at,
            _ws: true,  // flag so we can identify it later
            reactions: [],
            attachments: [],
          };

      // If server sent reactions/attachments in raw, preserve them
      if (raw.reactions) normalized.reactions = raw.reactions;
      if (raw.attachments) normalized.attachments = raw.attachments;

      // Avoid duplicates (WS echo after optimistic add)
      const exists = state.messages.some(
        (m) => m.id === normalized.id && !m._pending
      );
      if (exists) return;

      // Replace matching pending (optimistic) message
      const pendingIdx = normalized._pending
        ? -1
        : state.messages.findIndex(
            (m) => m._pending && m.text === normalized.text
          );

      if (pendingIdx !== -1) {
        state.messages[pendingIdx] = normalized;
      } else {
        state.messages.push(normalized);
      }

      // Update last_message in conversations list
      const convIndex = state.conversations.findIndex(
        (c) => c.id === (normalized.conversation ?? state.activeConversation)
      );
      if (convIndex !== -1) {
        state.conversations[convIndex].last_message = normalized;
      }
    },

    addReaction: (state, action) => {
      const { message_id, emoji, user_id } = action.payload;
      const msg = state.messages.find(m => String(m.id) === String(message_id));
      if (!msg) return;
      msg.reactions = msg.reactions || [];
      // prevent duplicate from same user
      const exists = msg.reactions.find(r => String(r.user?.id) === String(user_id) && r.emoji === emoji);
      if (!exists) {
        msg.reactions.push({ user: { id: user_id }, emoji });
      }
    },

    removeReaction: (state, action) => {
      const { message_id, emoji, user_id } = action.payload;
      const msg = state.messages.find(m => String(m.id) === String(message_id));
      if (!msg || !msg.reactions) return;
      msg.reactions = msg.reactions.filter(r => !(String(r.user?.id) === String(user_id) && r.emoji === emoji));
    },

    /** Replace a pending optimistic message with the confirmed one from message_ack */
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
