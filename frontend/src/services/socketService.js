// Wraps a native WebSocket connection to a Django Channels consumer.
//
// Expected backend contract (adjust to match your consumer):
//   routing.py:  path("ws/chat/<str:room_name>/", ChatConsumer.as_asgi())
//   ChatConsumer.receive(json.dumps({ type: "chat.message", message, sender })
//   ChatConsumer broadcasts back: { type: "chat.message", message, sender, timestamp }
//
// This class auto-reconnects with backoff and exposes simple callbacks so
// React components don't need to know about the underlying socket.

const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

export class ChatSocket {
  constructor(roomName, { onMessage, onStatusChange } = {}) {
    this.roomName = roomName;
    this.onMessage = onMessage || (() => {});
    this.onStatusChange = onStatusChange || (() => {});
    this.socket = null;
    this.reconnectAttempts = 0;
    this.shouldReconnect = true;
    this.maxReconnectDelay = 10000;
  }

  connect() {
    const url = `${WS_BASE_URL}/ws/chat/${this.roomName}/`;
    this.onStatusChange("connecting");
    
    const token = localStorage.getItem("access_token");
    if (token) {
      this.socket = new WebSocket(url, ["access_token", token]);
    } else {
      this.socket = new WebSocket(url);
    }

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.onStatusChange("connected");
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (err) {
        console.error("Failed to parse websocket payload", err);
      }
    };

    this.socket.onclose = () => {
      this.onStatusChange("disconnected");
      if (this.shouldReconnect) this._scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.onStatusChange("error");
      this.socket?.close();
    };
  }

  _scheduleReconnect() {
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, this.maxReconnectDelay);
    this.reconnectAttempts += 1;
    setTimeout(() => {
      if (this.shouldReconnect) this.connect();
    }, delay);
  }

  send(message, sender = "agent") {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "chat.message", message, sender }));
      return true;
    }
    return false;
  }

  sendTyping(isTyping) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
    }
  }

  close() {
    this.shouldReconnect = false;
    this.socket?.close();
  }
}
