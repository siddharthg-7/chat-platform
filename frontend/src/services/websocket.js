import { store } from '../store/store';
import { addMessage, addOnlineUser, removeOnlineUser, updateMessageStatus } from '../store/slices/chatSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 10000;
    this.baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/chat';
    this.pingInterval = null;
    this.pongTimeout = null;
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
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.socket.onmessage = (event) => {
      this.resetHeartbeat();
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
        case 'pong':
          // Received heartbeat response
          break;
        // Handle typing indicators via local component state or specialized slice if needed
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting...');
      this.stopHeartbeat();
      this.socket = null;
      
      const delay = Math.min(1000 * (2 ** this.reconnectAttempts), this.maxReconnectDelay);
      this.reconnectAttempts++;
      setTimeout(() => this.connect(conversationId), delay);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  startHeartbeat() {
    this.pingInterval = setInterval(() => {
      this.send({ action: 'ping' });
      this.pongTimeout = setTimeout(() => {
        console.log('Heartbeat timeout, closing connection...');
        if (this.socket) this.socket.close();
      }, 5000);
    }, 30000);
  }

  stopHeartbeat() {
    clearInterval(this.pingInterval);
    clearTimeout(this.pongTimeout);
  }

  resetHeartbeat() {
    this.stopHeartbeat();
    this.startHeartbeat();
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
      this.stopHeartbeat();
      this.socket.onclose = null; // Prevent auto-reconnect
      this.socket.close();
      this.socket = null;
    }
  }
}

const wsService = new WebSocketService();
export default wsService;
