import { store } from '../store/store';
import { addMessage, addOnlineUser, removeOnlineUser, updateMessageStatus } from '../store/slices/chatSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectTimeout = 3000;
    this.baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/chat';
  }

  connect(conversationId) {
    if (this.socket) {
      this.disconnect();
    }

    const token = localStorage.getItem('access_token');
    const wsUrl = `${this.baseUrl}/${conversationId}/?token=${token}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected.');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      
      switch (data.action) {
        case 'receive_message':
          store.dispatch(addMessage(data));
          break;
        case 'user_online':
          store.dispatch(addOnlineUser(data.user_id));
          break;
        case 'user_offline':
          store.dispatch(removeOnlineUser(data.user_id));
          break;
        case 'message_read':
          store.dispatch(updateMessageStatus({ message_id: data.message_id, status: 'read' }));
          break;
        // Handle typing indicators via local component state or specialized slice if needed
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting...');
      this.socket = null;
      setTimeout(() => this.connect(conversationId), this.reconnectTimeout);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not open.');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.onclose = null; // Prevent auto-reconnect
      this.socket.close();
      this.socket = null;
    }
  }
}

const wsService = new WebSocketService();
export default wsService;
