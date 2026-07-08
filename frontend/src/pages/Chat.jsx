import React, { useRef, useState, useEffect } from "react";

import Sidebar from "@/components/chat/Sidebar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import MessageInput from "@/components/chat/MessageInput";
import EmptyChat from "@/components/chat/EmptyChat";
import ChatArea from "@/components/chat/ChatArea";

import { contacts } from "@/data/chatData";

const MIN_CHAT_LIST_WIDTH = 320;

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(contacts[0]);

  const [chatListWidth, setChatListWidth] = useState(360);

  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      let newWidth = e.clientX - rect.left;

      const maxWidth = rect.width * 0.45;

      if (newWidth < MIN_CHAT_LIST_WIDTH)
        newWidth = MIN_CHAT_LIST_WIDTH;

      if (newWidth > maxWidth)
        newWidth = maxWidth;

      setChatListWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    if (isDragging) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">

      {/* Fixed Navigation */}

      <Sidebar />

      {/* Remaining Layout */}

      <div
        ref={containerRef}
        className="flex flex-1 overflow-hidden h-full"
      >
        {/* Chats Panel */}
        <div
          style={{ width: `${chatListWidth}px` }}
          className="shrink-0 h-full"
        >
          <ChatSidebar
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
          />
        </div>

        {/* Resize Divider */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className="group relative w-[6px] cursor-col-resize bg-transparent transition"
        >
          <div
            className="
              absolute
              left-1/2
              top-0
              h-full
              w-[2px]
              -translate-x-1/2
              rounded-full
              bg-transparent
              transition-all
              duration-200
              group-hover:bg-emerald-500
            "
          />
        </div>

        {/* Chat Area Wrapper */}
        <div className="flex-1 min-w-0 h-full overflow-hidden">
          <ChatArea selectedChat={selectedChat} />
        </div>
      </div>

    </div>
  );
};

export default Chat;