import React from "react";
import MessageBubble from "./MessageBubble";
import { useSelector } from 'react-redux';

const ChatMessages = () => {
  const { messages } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-8 py-8">
        <div className="sticky top-4 z-10 flex justify-center">
          <span className="rounded-full bg-slate-800 px-4 py-1 text-xs text-slate-300 shadow">
            Today
          </span>
        </div>
        {messages.map((msg) => {
          const senderName = msg.sender?.username || 'Unknown';
          const isIncoming = senderName !== user?.username;
          
          const formattedMessage = {
            id: msg.id,
            text: msg.text,
            sender: senderName,
            incoming: isIncoming,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: msg.is_read
          };

          return (
            <MessageBubble
              key={msg.id}
              message={formattedMessage}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ChatMessages;