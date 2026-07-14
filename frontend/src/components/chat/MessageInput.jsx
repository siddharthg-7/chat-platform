import React, { useState, useEffect, useRef } from "react";
import EmojiPicker from 'emoji-picker-react';
import { Smile, Paperclip, Send } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import EmojiPicker from 'emoji-picker-react';
import { addMessage } from '@/store/slices/chatSlice';
import { chatService } from '@/services/chat.service';
import wsService from '@/services/websocket';
import { chatService } from '@/services/chat.service';

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();
  const { activeConversation } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current && activeConversation) {
        wsService.sendTypingStop();
        isTypingRef.current = false;
      }
    };
  }, [activeConversation]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);

    if (!activeConversation) return;

    if (!isTypingRef.current && val.trim().length > 0) {
      wsService.sendTypingStart();
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

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

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      wsService.sendTypingStop();
      isTypingRef.current = false;
    }

    // If there are files selected, use REST endpoint which supports multipart
    if (selectedFiles.length > 0) {
      try {
        const filesArray = Array.from(selectedFiles);
        const resp = await chatService.sendMessage(activeConversation, textToSend, filesArray);
        // server returns the created message
        dispatch(addMessage(resp));
        setMessage("");
        setSelectedFiles([]);
      } catch (err) {
        console.error('Failed to upload files', err);
        alert('Failed to upload files');
      }
      return;
    }

    // No files — use websocket optimistic flow
    if (!textToSend) return;
    setMessage("");

    const tempId = 'pending-' + Date.now();

    const optimisticMessage = {
      id: tempId,
      conversation: activeConversation,
      sender: { id: user?.id, username: user?.username },
      text: textToSend,
      is_read: false,
      is_delivered: false,
      created_at: new Date().toISOString(),
      _pending: true,
    };
    dispatch(addMessage(optimisticMessage));

    try {
      wsService.sendMessage(textToSend, tempId);
    } catch (error) {
      console.error("Failed to send message via WebSocket:", error);
      toast.error("Message failed to send");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    if (!file || !activeConversation) return;

    setUploading(true);
    try {
      const savedMessage = await chatService.sendMessage(activeConversation, '', [file]);
      dispatch(addMessage({ ...savedMessage, _pending: false }));
    } catch (err) {
      console.error(err);
      toast.error("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-panel)] p-4">
      <div className="flex items-center gap-3">
        <div className="relative" ref={emojiRef}>
          <button
            type="button"
            onClick={() => setShowEmoji((p) => !p)}
            className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text)]"
          >
            <Smile className="h-5 w-5" />
          </button>
          {showEmoji && (
            <div className="absolute bottom-14 left-0 z-20">
              <EmojiPicker
                theme="dark"
                onEmojiClick={(emojiData) => setMessage((prev) => prev + emojiData.emoji)}
              />
            </div>
          )}
        </div>

        <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx" />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text)] disabled:opacity-40"
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
            flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-glass)]
            px-5 py-3 text-sm text-[var(--text)] outline-none
            placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]
            transition-all duration-200
          "
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim()}
          className="
            flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-white
            transition hover:scale-105 hover:opacity-90
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
          "
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </footer>
  );
};

export default MessageInput;