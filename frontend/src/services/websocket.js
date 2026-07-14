import { store } from '../store/store';
import {
  addMessage,
  confirmMessage,
  addOnlineUser,
  removeOnlineUser,
  updateMessageStatus,
  setTypingUser,
  clearTypingUser,
  updateConversationPreview,
} from '../store/slices/chatSlice';
import { toast } from 'react-toastify';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectTimeout = 3000;
    this.baseUrl =
      import.meta.env.VITE_WS_URL ||
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/chat`;
    this._currentConversationId = null;
    this._intentionalClose = false;
  }

  connect(conversationId) {
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN &&
      this._currentConversationId === conversationId
    ) {
      return;
    }

    this.disconnect(false);
    this._currentConversationId = conversationId;
    this._intentionalClose = false;

    const token = localStorage.getItem('access_token');
    const wsUrl = `${this.baseUrl}/${conversationId}/?token=${token}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('[WS] Connected to conversation', conversationId);
    };

    this.socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.error('[WS] Failed to parse message', event.data);
        return;
      }

      switch (data.action) {
        case 'receive_message': {
          store.dispatch(addMessage(data));

          store.dispatch(
            updateConversationPreview({
              conversationId: data.conversation_id,
              lastMessage: data.text || (data.attachment_url ? '📎 Attachment' : ''),
              lastMessageTime: data.created_at,
            })
          );

          const state = store.getState();
          const isSelf = data.sender_id === state.auth.user?.id;
          const isActiveChat = data.conversation_id === state.chat.activeConversation;
          const isTabHidden = document.hidden;

          if (!isSelf && (!isActiveChat || isTabHidden)) {
            toast.info(`${data.sender_username || 'New message'}: ${data.text || '📎 Attachment'}`);

            if (Notification.permission === 'granted') {
              new Notification(data.sender_username || 'New message', {
                body: data.text || 'Sent an attachment',
                icon: '/logo.png',
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission();
            }
          }
          break;
        }

        case 'message_ack':
          store.dispatch(
            confirmMessage({
              temp_id: data.temp_id,
              message_id: data.message_id,
              created_at: data.created_at,
            })
          );
          break;

        case 'user_online':
          store.dispatch(addOnlineUser(data.user_id));
          break;

        case 'user_offline':
          store.dispatch(removeOnlineUser(data.user_id));
          break;

        case 'message_read':
          store.dispatch(
            updateMessageStatus({ message_id: data.message_id, status: 'read' })
          );
          break;

        case 'typing_start':
          store.dispatch(setTypingUser(data.sender_id));
          break;

        case 'typing_stop':
          store.dispatch(clearTypingUser(data.sender_id));
          break;

        default:
          break;
      }
    };

    this.socket.onclose = () => {
      console.log('[WS] Disconnected');
      this.socket = null;
      if (!this._intentionalClose && this._currentConversationId) {
        setTimeout(() => {
          if (!this._intentionalClose) {
            this.connect(this._currentConversationId);
          }
        }, this.reconnectTimeout);
      }
    };

    this.socket.onerror = (error) => {
      console.error('[WS] Error:', error);
    };
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
      return true;
    }
    console.warn('[WS] Cannot send — socket not open');
    return false;
  }

  sendMessage(text, tempId) {
    return this.send({ action: 'send_message', text, temp_id: tempId });
  }

  sendTypingStart() {
    return this.send({ action: 'typing_start' });
  }

  sendTypingStop() {
    return this.send({ action: 'typing_stop' });
  }

  sendReadReceipt(messageId) {
    return this.send({ action: 'message_read', message_id: messageId });
  }

  disconnect(intentional = true) {
    this._intentionalClose = intentional;
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
    if (intentional) {
      this._currentConversationId = null;
    }
  }
}

const wsService = new WebSocketService();
export default wsService;