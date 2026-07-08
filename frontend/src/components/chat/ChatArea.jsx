import React from "react";

import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import EmptyChat from "./EmptyChat";

const ChatArea = ({ selectedChat }) => {
  if (!selectedChat) return <EmptyChat />;

  return (
    <section className="flex h-full w-full flex-col bg-slate-950">

      <ChatHeader chat={selectedChat} />

      <ChatMessages />

      <MessageInput />

    </section>
  );
};

export default ChatArea;