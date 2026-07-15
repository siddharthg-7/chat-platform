import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  nextCursor: null, // holds the URL/cursor to fetch older messages
  onlineUsers: [],
  typingUsers: {}, // { [conversationId]: [userIds] }
  loading: false,
  replyingTo: null,      // holds the message object being replied to
  editingMessage: null,  // holds the message object being edited
  searchQuery: '',       // query to search within active chat
  rightSidebarOpen: false,
  rightSidebarType: null, // 'profile' or 'group_info'
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload.sort((a, b) => {
        const timeA = new Date(a.last_message?.created_at || a.updated_at || 0);
        const timeB = new Date(b.last_message?.created_at || b.updated_at || 0);
        return timeB - timeA;
      });
    },

    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      state.messages = []; // Clear current messages on swap
      state.nextCursor = null;
      state.replyingTo = null;
      state.editingMessage = null;
      state.searchQuery = '';
      if (action.payload) {
        // Reset unread count locally when entering a conversation
        const conv = state.conversations.find(c => c.id === action.payload);
        if (conv) {
          conv.unread_count = 0;
        }
      }
    },

    setMessages: (state, action) => {
      state.messages = action.payload.messages;
      state.nextCursor = action.payload.nextCursor;
    },

    prependMessages: (state, action) => {
      state.messages = [...action.payload.messages, ...state.messages];
      state.nextCursor = action.payload.nextCursor;
    },

    addMessage: (state, action) => {
      const { message, isSelf } = action.payload;
      const conversationId = message.conversation;

      // Check if message already exists in state
      const existsIdx = state.messages.findIndex(m => m.id === message.id);
      if (existsIdx !== -1) return;

      // Handle optimistic UI matching
      const pendingIdx = message.temp_id 
        ? state.messages.findIndex(m => m.id === message.temp_id || m.temp_id === message.temp_id) 
        : -1;

      if (pendingIdx !== -1) {
        state.messages[pendingIdx] = { ...state.messages[pendingIdx], ...message, _pending: false };
      } else {
        if (state.activeConversation === conversationId) {
          state.messages.push(message);
        }
      }

      // Update last message preview in conversations
      const convIdx = state.conversations.findIndex(c => c.id === conversationId);
      if (convIdx !== -1) {
        state.conversations[convIdx].last_message = message;
        
        // Increment unread count if we received a message in an inactive chat
        if (state.activeConversation !== conversationId && !isSelf) {
          state.conversations[convIdx].unread_count = (state.conversations[convIdx].unread_count || 0) + 1;
        }

        // Re-sort conversation list by latest activity
        state.conversations.sort((a, b) => {
          const timeA = new Date(a.last_message?.created_at || a.updated_at || 0);
          const timeB = new Date(b.last_message?.created_at || b.updated_at || 0);
          return timeB - timeA;
        });
      }
    },

    confirmMessage: (state, action) => {
      const { temp_id, message_id, created_at } = action.payload;
      const idx = state.messages.findIndex((m) => m.id === temp_id || m.temp_id === temp_id);
      if (idx !== -1) {
        state.messages[idx].id = message_id;
        state.messages[idx].created_at = created_at;
        state.messages[idx]._pending = false;
      }
    },

    updateMessageStatus: (state, action) => {
      const { message_id, status } = action.payload;
      const msg = state.messages.find((m) => m.id === message_id);
      if (msg && status === 'read') {
        msg.is_read = true;
        msg.is_delivered = true;
      }
    },

    batchUpdateMessageStatus: (state, action) => {
      const { message_ids, status } = action.payload;
      message_ids.forEach(id => {
        const msg = state.messages.find(m => m.id === id);
        if (msg) {
          if (status === 'read') msg.is_read = true;
          msg.is_delivered = true;
        }
      });
    },

    updateMessageReactions: (state, action) => {
      const { messageId, reactions } = action.payload;
      const msg = state.messages.find((m) => m.id === messageId);
      if (msg) {
        msg.reactions = reactions;
      }
    },

    editMessageText: (state, action) => {
      const { messageId, text } = action.payload;
      const msg = state.messages.find(m => m.id === messageId);
      if (msg) {
        msg.text = text;
        msg.is_edited = true;
      }
    },

    deleteMessageEveryone: (state, action) => {
      const { messageId } = action.payload;
      const msg = state.messages.find(m => m.id === messageId);
      if (msg) {
        msg.text = "This message was deleted.";
        msg.voice_note = null;
        msg.is_edited = false;
        msg.attachments = [];
        msg.reactions = [];
      }
    },

    deleteMessageMe: (state, action) => {
      const { messageId } = action.payload;
      state.messages = state.messages.filter(m => m.id !== messageId);
    },

    toggleMessagePinStatus: (state, action) => {
      const { messageId, is_pinned } = action.payload;
      const msg = state.messages.find(m => m.id === messageId);
      if (msg) {
        msg.is_pinned = is_pinned;
      }
    },

    toggleMessageStarStatus: (state, action) => {
      const { messageId, starred } = action.payload;
      const msg = state.messages.find(m => m.id === messageId);
      if (msg) {
        msg.starred = starred;
      }
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

    setTypingUser: (state, action) => {
      const { conversationId, userId } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      if (!state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      }
    },

    clearTypingUser: (state, action) => {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
      }
    },

    setReplyingTo: (state, action) => {
      state.replyingTo = action.payload;
    },

    setEditingMessage: (state, action) => {
      state.editingMessage = action.payload;
    },

    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    setRightSidebar: (state, action) => {
      state.rightSidebarOpen = action.payload.open;
      state.rightSidebarType = action.payload.type;
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  setMessages,
  prependMessages,
  addMessage,
  confirmMessage,
  updateMessageStatus,
  batchUpdateMessageStatus,
  updateMessageReactions,
  editMessageText,
  deleteMessageEveryone,
  deleteMessageMe,
  toggleMessagePinStatus,
  toggleMessageStarStatus,
  removeConversation,
  toggleMuteConversation,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setTypingUser,
  clearTypingUser,
  setReplyingTo,
  setEditingMessage,
  setSearchQuery,
  setRightSidebar,
} = chatSlice.actions;

export default chatSlice.reducer;
