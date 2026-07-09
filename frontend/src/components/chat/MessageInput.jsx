import React, { useState } from "react";
import {
  Smile,
  Paperclip,
  Send,
} from "lucide-react";

import { useSelector, useDispatch } from 'react-redux';
import { chatService } from '@/services/chat.service';
import { addMessage } from '@/store/slices/chatSlice';

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const dispatch = useDispatch();
  const { activeConversation } = useSelector((state) => state.chat);

  const handleSend = async () => {
    if (!message.trim() || !activeConversation || sending) return;

    const textToSend = message.trim();
    setMessage(""); // optimistic clear
    setSending(true);

    try {
      const sentMessage = await chatService.sendMessage(activeConversation, textToSend);
      // Push into redux store immediately so it shows up without waiting on WS echo
      dispatch(addMessage(sentMessage));
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(textToSend); // restore text so user doesn't lose it
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="border-t border-wa-border bg-wa-panel p-4">
      <div className="flex items-center gap-3">

        <button
          type="button"
          className="rounded-full p-2 text-wa-text-muted transition hover:bg-wa-panel-hover hover:text-wa-text"
        >
          <Smile className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="rounded-full p-2 text-wa-text-muted transition hover:bg-wa-panel-hover hover:text-wa-text"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
            border-wa-border
            bg-wa-bg
            px-5
            py-3
            text-sm
            text-wa-text
            outline-none
            placeholder:text-wa-text-muted
            focus:border-wa-teal
          "
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-wa-teal
            text-wa-bg
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