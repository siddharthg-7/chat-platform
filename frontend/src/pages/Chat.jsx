import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { chatService } from '../services/chat.service';
import wsService from '../services/websocket';
import { setConversations, setMessages, setActiveConversation } from '../store/slices/chatSlice';

import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatArea from "@/components/chat/ChatArea";

const MIN_CHAT_LIST_WIDTH = 320;

const Chat = () => {
  const dispatch = useDispatch();
  const { activeConversation } = useSelector((state) => state.chat);

  const [chatListWidth, setChatListWidth] = useState(360);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    chatService.getConversations().then((data) => {
      dispatch(setConversations(data));
      if (data.length > 0 && !activeConversation) {
        dispatch(setActiveConversation(data[0].id));
      }
    }).catch(console.error);
  }, [dispatch]);

  // Fetch messages and connect WS when activeConversation changes
  useEffect(() => {
    if (activeConversation) {
      chatService.getMessages(activeConversation).then((data) => {
        dispatch(setMessages(data));
      }).catch(console.error);

      wsService.connect(activeConversation);
    }
    
    return () => {
      wsService.disconnect();
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
    <div className="flex-1 flex overflow-hidden bg-slate-950">
      <div ref={containerRef} className="flex flex-1 overflow-hidden h-full">
        <div style={{ width: `${chatListWidth}px` }} className="shrink-0 h-full">
          <ChatSidebar />
        </div>

        <div
          onMouseDown={() => setIsDragging(true)}
          className="group relative w-[6px] cursor-col-resize bg-transparent transition"
        >
          <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded-full bg-transparent transition-all duration-200 group-hover:bg-emerald-500" />
        </div>

        <div className="flex-1 min-w-0 h-full overflow-hidden">
          <ChatArea />
        </div>
      </div>
    </div>
  );
};

export default Chat;