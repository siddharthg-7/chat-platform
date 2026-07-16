import { store } from '../store/store';
import {
  addMessage,
  confirmMessage,
  addOnlineUser,
  removeOnlineUser,
  setOnlineUsers,
  updateMessageStatus,
  batchUpdateMessageStatus,
  updateMessageReactions,
  editMessageText,
  deleteMessageEveryone,
  deleteMessageMe,
  toggleMessagePinStatus,
  setTypingUser,
  clearTypingUser,
} from '../store/slices/chatSlice';
import { toast } from 'sonner';

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    // WhatsApp-like clean double chime
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.04);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.08);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.warn("AudioContext not allowed or not supported:", e);
  }
}

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectTimeout = 1000;
    this.maxReconnectTimeout = 30000;
    this.pingInterval = null;
    this.offlineQueue = [];
    this.unackedMessages = new Map();
    this.typingTimers = new Map();
    this.baseUrl =
      import.meta.env.VITE_WS_URL ||
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/chat`;
    this._intentionalClose = false;
  }

  connect() {
    // If socket is open or connecting, do not re-establish
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
       this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this._intentionalClose = false;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const wsUrl = `${this.baseUrl}/?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = async () => {
      console.log('[WS] Persistent global WebSocket connected.');
      this.reconnectTimeout = 1000;
      this.startHeartbeat();
      this.flushOfflineQueue();
      this.syncMissedMessages();
    };

    this.socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.error('[WS] Failed to parse message:', event.data);
        return;
      }

      if (data.action === 'pong') {
        return; // Heartbeat response
      }

      const state = store.getState();
      const currentUserId = state.auth.user?.id;

      switch (data.action) {
        case 'receive_message': {
          const isSelf = data.sender_id === currentUserId;
          const isActiveChat = data.conversation_id === state.chat.activeConversation;
          const isTabHidden = document.hidden;

          const normalizedMessage = {
            id: data.message_id,
            conversation: data.conversation_id,
            sender: { id: data.sender_id, username: data.sender_username },
            text: data.text,
            is_read: data.is_read || false,
            is_delivered: data.is_delivered || true,
            created_at: data.created_at,
            reply_to: data.reply_to_id ? { id: data.reply_to_id } : null,
            voice_note: data.voice_note || null,
            attachments: data.attachments || [],
            reactions: data.reactions || [],
          };

          store.dispatch(addMessage({ message: normalizedMessage, isSelf }));

          if (!isSelf) {
            // Trigger read receipt immediately if we are actively viewing this chat
            if (isActiveChat && !isTabHidden) {
              this.sendReadReceipt(data.conversation_id, data.message_id);
            } else {
              // Play notification alert
              playNotificationSound();

              // Tab is hidden -> OS-level browser notification (works in background)
              if (isTabHidden) {
                if (Notification.permission === 'granted') {
                  new Notification(data.sender_username || 'New message', {
                    body: data.text || 'Sent an attachment',
                    icon: '/logo.png',
                  });
                } else if (Notification.permission !== 'denied') {
                  Notification.requestPermission();
                }
              } else {
                // Tab is visible -> clean in-app toast
                toast(`${data.sender_username || 'New message'}: ${data.text || '📎 Attachment'}`);
              }
            }
          }
          break;
        }

        case 'message_delivered':
          if (data.user_id !== currentUserId) {
            store.dispatch(
              updateMessageStatus({ message_id: data.message_id, status: 'delivered' })
            );
          }
          break;

        case 'message_ack':
          if (data.temp_id) {
            this.unackedMessages.delete(data.temp_id);
          }
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

        case 'online_users':
          store.dispatch(setOnlineUsers(data.user_ids));
          break;

        case 'message_read':
          if (data.reader_id !== currentUserId) {
            store.dispatch(
              updateMessageStatus({ message_id: data.message_id, status: 'read' })
            );
          }
          break;

        case 'read_all_confirm':
          if (data.reader_id !== currentUserId) {
            store.dispatch(
              batchUpdateMessageStatus({ message_ids: data.message_ids, status: 'read' })
            );
          }
          break;

        case 'typing_start':
          store.dispatch(setTypingUser({ conversationId: data.conversation_id, userId: data.sender_id }));
          
          // Auto-clear typing indicator after 3s if no new typing_start arrives
          const timerKey = `${data.conversation_id}-${data.sender_id}`;
          if (this.typingTimers.has(timerKey)) {
            clearTimeout(this.typingTimers.get(timerKey));
          }
          this.typingTimers.set(timerKey, setTimeout(() => {
            store.dispatch(clearTypingUser({ conversationId: data.conversation_id, userId: data.sender_id }));
            this.typingTimers.delete(timerKey);
          }, 3000));
          break;

        case 'typing_stop':
          store.dispatch(clearTypingUser({ conversationId: data.conversation_id, userId: data.sender_id }));
          
          const stopTimerKey = `${data.conversation_id}-${data.sender_id}`;
          if (this.typingTimers.has(stopTimerKey)) {
            clearTimeout(this.typingTimers.get(stopTimerKey));
            this.typingTimers.delete(stopTimerKey);
          }
          break;

        case 'message_reactions_updated':
          store.dispatch(
            updateMessageReactions({ messageId: data.message_id, reactions: data.reactions })
          );
          break;

        case 'message_edited':
          store.dispatch(
            editMessageText({ messageId: data.message_id, text: data.text })
          );
          break;

        case 'message_deleted_everyone':
          store.dispatch(
            deleteMessageEveryone({ messageId: data.message_id })
          );
          break;

        case 'message_deleted_me':
          store.dispatch(
            deleteMessageMe({ messageId: data.message_id })
          );
          break;

        case 'message_pin_updated':
          store.dispatch(
            toggleMessagePinStatus({ messageId: data.message_id, is_pinned: data.is_pinned })
          );
          break;


        default:
          break;
      }
    };

    this.socket.onclose = () => {
      this.stopHeartbeat();
      console.log('[WS] Global WebSocket disconnected.');
      this.socket = null;
      if (!this._intentionalClose) {
        // Add random jitter between 0% and 30% of the timeout to prevent thundering herd
        const jitter = this.reconnectTimeout * (Math.random() * 0.3);
        const timeoutWithJitter = this.reconnectTimeout + jitter;
        
        setTimeout(() => {
          if (!this._intentionalClose) {
            this.connect();
          }
        }, timeoutWithJitter);
        
        this.reconnectTimeout = Math.min(this.reconnectTimeout * 2, this.maxReconnectTimeout);
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
    if (!this._intentionalClose && data.action === 'send_message') {
      this.offlineQueue.push(data);
    }
    return false;
  }

  sendMessage(conversationId, text, tempId, replyToId = null, voiceNote = null) {
    const data = {
      action: 'send_message',
      conversation_id: conversationId,
      text,
      temp_id: tempId,
      client_id: tempId, // Send tempId as client_id for backend idempotency
      reply_to_id: replyToId,
      voice_note: voiceNote,
    };
    
    // Add to unacked map for retries (timeout 5s)
    if (tempId) {
      this.unackedMessages.set(tempId, data);
      setTimeout(() => {
        if (this.unackedMessages.has(tempId)) {
          console.warn(`[WS] Message ${tempId} unacked. Retrying...`);
          this.send(this.unackedMessages.get(tempId));
        }
      }, 5000);
    }
    
    return this.send(data);
  }

  sendTypingStart(conversationId) {
    return this.send({ action: 'typing_start', conversation_id: conversationId });
  }

  sendTypingStop(conversationId) {
    return this.send({ action: 'typing_stop', conversation_id: conversationId });
  }

  sendReadReceipt(conversationId, messageId) {
    return this.send({ action: 'message_read', conversation_id: conversationId, message_id: messageId });
  }

  sendReadAll(conversationId) {
    return this.send({ action: 'read_all', conversation_id: conversationId });
  }

  sendReaction(conversationId, messageId, emoji) {
    return this.send({
      action: 'message_reaction',
      conversation_id: conversationId,
      message_id: messageId,
      emoji: emoji,
    });
  }

  sendEditMessage(conversationId, messageId, text) {
    return this.send({
      action: 'edit_message',
      conversation_id: conversationId,
      message_id: messageId,
      text: text,
    });
  }

  sendDeleteMessage(conversationId, messageId, deleteType) {
    return this.send({
      action: 'delete_message',
      conversation_id: conversationId,
      message_id: messageId,
      delete_type: deleteType, // 'me' or 'everyone'
    });
  }

  sendTogglePin(conversationId, messageId) {
    return this.send({
      action: 'toggle_pin',
      conversation_id: conversationId,
      message_id: messageId,
    });
  }

  disconnect(intentional = true) {
    this._intentionalClose = intentional;
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }

  startHeartbeat() {
    this.pingInterval = setInterval(() => {
      this.send({ action: 'ping' });
    }, 15000);
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  flushOfflineQueue() {
    while (this.offlineQueue.length > 0) {
      const data = this.offlineQueue.shift();
      this.send(data);
    }
  }

  async syncMissedMessages() {
    const state = store.getState();
    const token = localStorage.getItem('access_token');
    const conversations = state.chat.conversations;
    
    for (const conv of conversations) {
      if (!conv.last_message) continue;
      
      const lastSeq = conv.last_message.seq_num || 0;
      
      try {
        const res = await fetch(`/api/chat/messages/${conv.id}/sync/?since_seq=${lastSeq}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const newMessages = await res.json();
          newMessages.forEach(msg => {
            const isSelf = msg.sender.id === state.auth.user?.id;
            store.dispatch(addMessage({ message: msg, isSelf }));
          });
        }
      } catch (err) {
        console.error('Failed to sync messages for', conv.id, err);
      }
    }
  }
}

const wsService = new WebSocketService();
export default wsService;
