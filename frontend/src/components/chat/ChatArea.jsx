import React from "react";

import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import EmptyChat from "./EmptyChat";

import { useSelector } from 'react-redux';

const ChatArea = () => {
  const { conversations, activeConversation, onlineUsers } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  if (!activeConversation) return <EmptyChat />;

  const chat = conversations.find(c => c.id === activeConversation);
  
  // Map conversation for ChatHeader
  const otherParticipant = chat?.participants?.find(p => p.username !== user?.username) || chat?.participants?.[0];
  const contactName = chat?.is_group ? chat.name : (otherParticipant?.username || 'Unknown');
  const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant.id) : false;

  const mappedChat = {
    name: contactName,
    online: isOnline,
    avatar: null,
  };

  return (
    <section className="flex h-full w-full flex-col bg-slate-950">

      <ChatHeader chat={mappedChat} />

      <ChatMessages />

      <MessageInput />

    </section>
  );
};

export default ChatArea;