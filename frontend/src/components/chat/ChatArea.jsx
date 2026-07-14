import React from "react";

import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import EmptyChat from "./EmptyChat";

import { useSelector } from 'react-redux';

const ChatArea = ({ messagesLoading }) => {
  const { conversations, activeConversation, onlineUsers } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  if (!activeConversation) return <EmptyChat />;

  const chat = conversations.find(c => c.id === activeConversation);

  const otherParticipant = chat?.participants?.find(p => p.username !== user?.username) || chat?.participants?.[0];
  const contactName = chat?.is_group ? chat.name : (otherParticipant?.username || 'Unknown');
  const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant.id) : false;

  const mappedChat = {
    id: chat?.id,
    name: contactName,
    online: isOnline,
    avatar: null,
    isGroup: chat?.is_group,
    otherUserId: otherParticipant?.id,
  };

  return (
    <section className="flex h-full w-full flex-col bg-base">
      <ChatHeader chat={mappedChat} />
      {messagesLoading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          Loading messages…
        </div>
      ) : (
        <ChatMessages />
      )}
      <MessageInput />
    </section>
  );
};

export default ChatArea;