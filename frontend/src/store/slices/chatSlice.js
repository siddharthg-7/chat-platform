import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
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
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // Update last message in conversations list
      const convIndex = state.conversations.findIndex(c => c.id === action.payload.conversation);
      if (convIndex !== -1) {
        state.conversations[convIndex].last_message = action.payload;
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
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
    },
    updateMessageStatus: (state, action) => {
      const msg = state.messages.find(m => m.id === action.payload.message_id);
      if (msg && action.payload.status === 'read') {
        msg.is_read = true;
      }
    }
  },
});

export const { 
  setConversations, 
  setActiveConversation, 
  setMessages, 
  addMessage, 
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  updateMessageStatus 
} = chatSlice.actions;

export default chatSlice.reducer;
