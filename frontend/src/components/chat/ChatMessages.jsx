import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { useSelector } from 'react-redux';

const ChatMessages = () => {
  const { messages, conversations, activeConversation, typingUsers } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const chat = conversations.find(c => c.id === activeConversation);
  const typingParticipants = chat?.participants?.filter(
    p => typingUsers.includes(p.id) && p.username !== user?.username
  ) || [];

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-base">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-8 py-8">
        <div className="sticky top-4 z-10 flex justify-center">
          <span className="rounded-full bg-glass px-4 py-1 text-xs text-muted-foreground shadow">
            Today
          </span>
        </div>
        {messages.map((msg) => {
          let senderName = msg.sender?.username;
          if (!senderName) {
            const participant = chat?.participants?.find(p => p.id === msg.sender?.id);
            senderName = participant?.username || (msg.sender?.id === user?.id ? user?.username : 'Unknown');
          }
          
          const isIncoming = senderName !== user?.username;
          
          const formattedMessage = {
            id: msg.id,
            text: msg.text,
            sender: senderName,
            incoming: isIncoming,
            time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            read: msg.is_read,
            // no way to reach MessageBubble even once the upload itself worked.
            attachments: msg.attachments || [],
            reactions: msg.reactions || [],
          };

          return (
            <MessageBubble
              key={msg.id}
              message={formattedMessage}
            />
          );
        })}

        {typingParticipants.length > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-2 text-xs text-muted-foreground italic">
            <span className="font-semibold text-accent">
              {typingParticipants.map(p => p.username).join(', ')}
            </span>{" "}
            {typingParticipants.length === 1 ? 'is' : 'are'} typing
            <span className="flex gap-0.5 ml-1 items-center">
              <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;