import React, { useState } from "react";
import {
  Smile,
  Paperclip,
  Send,
} from "lucide-react";

import { useSelector } from 'react-redux';
import { chatService } from '@/services/chat.service';

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const { activeConversation } = useSelector((state) => state.chat);

  const handleSend = async () => {
    if (!message.trim() || !activeConversation) return;

    try {
      await chatService.sendMessage(activeConversation, message.trim());
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <footer className="border-t border-wa-border bg-wa-panel p-4">
      <div className="flex items-center gap-3">

        {/* Emoji */}
        <button
          className="rounded-full p-2 text-wa-text-muted transition hover:bg-wa-panel-hover hover:text-wa-text"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* Attachment */}
        <button
          className="rounded-full p-2 text-wa-text-muted transition hover:bg-wa-panel-hover hover:text-wa-text"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Input */}
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
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

        {/* Send */}
        <button
          onClick={handleSend}
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
          "
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </footer>
  );
};

export default MessageInput;