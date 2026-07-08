import React from "react";
import MessageBubble from "./MessageBubble";
import { messages } from "../../data/chatData";

const ChatMessages = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-8 py-8">
        <div className="sticky top-4 z-10 flex justify-center">
          <span className="rounded-full bg-slate-800 px-4 py-1 text-xs text-slate-300 shadow">
            Today
          </span>
        </div>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatMessages;