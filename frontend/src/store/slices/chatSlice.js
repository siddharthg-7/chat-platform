import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],   // user IDs currently typing in active conversation
  loading: false,
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
        ? raw  // Already REST shape
        : {
            id: raw.message_id,
            conversation: state.activeConversation,
            sender: { id: raw.sender_id, username: null }, // username filled on render via onlineUsers
            text: raw.text,
            is_read: false,
            is_delivered: true,
            created_at: raw.created_at,
            _ws: true,  // flag so we can identify it later
          };

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
} = chatSlice.actions;

export default chatSlice.reducer;
