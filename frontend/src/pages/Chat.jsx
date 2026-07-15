import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { chatService } from '../services/chat.service';
import wsService from '../services/websocket';
import { setConversations, setMessages, setActiveConversation } from '../store/slices/chatSlice';

import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatArea from "@/components/chat/ChatArea";
import ChatRightSidebar from "@/components/chat/ChatRightSidebar";

const MIN_CHAT_LIST_WIDTH = 320;

const Chat = () => {
  const dispatch = useDispatch();
  const { activeConversation, rightSidebarOpen, rightSidebarType } = useSelector((state) => state.chat);

  const [chatListWidth, setChatListWidth] = useState(360);
  const [isDragging, setIsDragging] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    chatService.getConversations().then((data) => {
      dispatch(setConversations(data));
      if (data.length > 0 && !activeConversation) {
        dispatch(setActiveConversation(data[0].id));
      }
    }).catch(console.error);
  }, [dispatch]);

  useEffect(() => {
    let isCurrent = true;

    if (activeConversation) {
      setMessagesLoading(true);
      
      // Mark all messages as read in this conversation
      wsService.sendReadAll(activeConversation);

      chatService.getMessages(activeConversation)
        .then((data) => {
          if (isCurrent) dispatch(setMessages(data));
        })
        .catch((err) => {
          console.error(err);
          if (isCurrent) toast.error("Couldn't load messages. Try again.");
        })
        .finally(() => {
          if (isCurrent) setMessagesLoading(false);
        });
    }

    return () => {
      isCurrent = false;
    };
  }, [activeConversation, dispatch]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let newWidth = e.clientX - rect.left;
      const maxWidth = rect.width * 0.45;
      if (newWidth < MIN_CHAT_LIST_WIDTH) newWidth = MIN_CHAT_LIST_WIDTH;
      if (newWidth > maxWidth) newWidth = maxWidth;
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
    <div className="flex-1 flex overflow-hidden bg-base">
      <div ref={containerRef} className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar: Full width on mobile if no active chat, hidden on mobile if active chat. Fixed/resizable width on desktop */}
        <div 
          style={{ width: window.innerWidth < 768 ? '100%' : `${chatListWidth}px` }} 
          className={`shrink-0 h-full ${activeConversation ? 'hidden md:block' : 'w-full md:w-auto'}`}
        >
          <ChatSidebar />
        </div>

        {/* Resizer: Hidden on mobile */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className="group relative w-[6px] cursor-col-resize bg-transparent transition hidden md:block"
        >
          <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded-full bg-transparent transition-all duration-200 group-hover:bg-accent" />
        </div>

        {/* Chat Area: Hidden on mobile if no active chat, full width otherwise */}
        <div className={`flex-1 min-w-0 h-full overflow-hidden ${!activeConversation ? 'hidden md:flex flex-col' : 'flex flex-col'}`}>
          <ChatArea messagesLoading={messagesLoading} />
        </div>

        {/* Right Sidebar: Hidden completely on mobile for simplicity, or overlay (for now hidden on mobile) */}
        {rightSidebarOpen && (
          <div className="w-[320px] shrink-0 border-l border-[var(--border)] h-full bg-[var(--bg-panel)] animate-slide-in hidden xl:block">
            <ChatRightSidebar type={rightSidebarType} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
