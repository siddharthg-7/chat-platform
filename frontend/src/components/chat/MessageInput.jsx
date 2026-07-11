// frontend/src/components/chat/MessageInput.jsx
import React, { useState, useEffect, useRef } from "react";
import { Smile, Paperclip, Send } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '@/store/slices/chatSlice';
import wsService from '@/services/websocket';

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const { activeConversation } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current && activeConversation) {
        wsService.sendTypingStop();
        isTypingRef.current = false;
      }
    };
  }, [activeConversation]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);

    if (!activeConversation) return;

    if (!isTypingRef.current && val.trim().length > 0) {
      wsService.sendTypingStart();
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        wsService.sendTypingStop();
        isTypingRef.current = false;
      }
    }, 2000);
  };

  const handleSend = () => {
    if (!message.trim() || !activeConversation) return;

    const textToSend = message.trim();
    setMessage("");
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      wsService.sendTypingStop();
      isTypingRef.current = false;
    }

    const tempId = 'pending-' + Date.now();

    const optimisticMessage = {
      id: tempId,
      conversation: activeConversation,
      sender: { id: user?.id, username: user?.username },
      text: textToSend,
      is_read: false,
      is_delivered: false,
      created_at: new Date().toISOString(),
      _pending: true
    };
    dispatch(addMessage(optimisticMessage));

    try {
      wsService.sendMessage(textToSend, tempId);
    } catch (error) {
      console.error("Failed to send message via WebSocket:", error);
    }
  };

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-panel)] p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text)]"
        >
          <Smile className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text)]"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <input
          value={message}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="
            flex-1
            rounded-full
            border
            border-[var(--border)]
            bg-[var(--bg-glass)]
            px-5
            py-3
            text-sm
            text-[var(--text)]
            outline-none
            placeholder:text-[var(--text-muted)]
            focus:border-[var(--accent)]
            transition-all
            duration-200
          "
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim()}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-[var(--accent)]
            text-white
            transition
            hover:scale-105
            hover:opacity-90
            disabled:opacity-40
            disabled:cursor-not-allowed
            disabled:hover:scale-100
          "
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </footer>
  );
};

export default MessageInput;