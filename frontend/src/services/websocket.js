class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectTimeout = 3000;
  }

  connect(url) {
    if (this.socket) {
      console.warn('WebSocket is already connected.');
      return;
    }

    const token = localStorage.getItem('access_token');
    const wsUrl = `${url}?token=${token}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected.');
    };

    this.socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      // Dispatch events or update stores here
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting...');
      this.socket = null;
      setTimeout(() => this.connect(url), this.reconnectTimeout);
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
