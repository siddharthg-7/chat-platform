import React, { useState } from "react";
import { Search, Plus } from "lucide-react";

import ChatListItem from "./ChatListItem";
import { useSelector, useDispatch } from 'react-redux';
import { setActiveConversation } from '@/store/slices/chatSlice';

const ChatSidebar = () => {
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  
  const { conversations, activeConversation, onlineUsers } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  // Filter and map conversations to match what ChatListItem expects
  const mappedChats = conversations.filter((chat) => {
    const otherParticipant = chat.participants?.find(p => p.username !== user?.username) || chat.participants?.[0];
    const contactName = chat.is_group ? chat.name : (otherParticipant?.username || 'Unknown');
    return contactName.toLowerCase().includes(search.toLowerCase());
  }).map((chat) => {
    const otherParticipant = chat.participants?.find(p => p.username !== user?.username) || chat.participants?.[0];
    const contactName = chat.is_group ? chat.name : (otherParticipant?.username || 'Unknown');
    const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant.id) : false;
    
    return {
      id: chat.id,
      name: contactName,
      avatar: null,
      online: isOnline,
      time: chat.last_message ? new Date(chat.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      lastMessage: chat.last_message?.text || 'No messages yet',
      unread: 0 // TODO: implement unread count
    };
  });

  const pinnedChats = []; // TODO: implement pinning later
  const recentChats = mappedChats;

  const handleSelectChat = (chat) => {
    dispatch(setActiveConversation(chat.id));
  };

  return (
    <aside className="flex h-full flex-col bg-slate-900">

      {/* Header */}

      <div className="border-b border-slate-800 px-6 py-5">

        <div className="flex items-center justify-between">

          <h1 className="text-2xl font-bold text-white">
            Chats
          </h1>

          <button
            className="
            rounded-xl
            p-2
            text-slate-400
            transition
            hover:bg-slate-800
            hover:text-white
            "
          >
            <Plus size={18} />
          </button>

        </div>

        {/* Search */}

        <div className="relative mt-5">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-800
              py-3
              pl-11
              pr-4
              text-sm
              text-white
              placeholder:text-slate-500
              outline-none
              transition
              focus:border-emerald-500
            "
          />

        </div>

        {/* Filters */}

        <div className="mt-5 flex gap-2">

          <button className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-medium text-white">
            All
          </button>

          <button className="rounded-full bg-slate-800 px-4 py-1 text-xs text-slate-400 transition hover:bg-slate-700">
            Groups
          </button>

          <button className="rounded-full bg-slate-800 px-4 py-1 text-xs text-slate-400 transition hover:bg-slate-700">
            Unread
          </button>

        </div>

      </div>

      {/* Chat List */}

      <div className="flex-1 overflow-y-auto px-4 py-5">

        {/* Pinned */}

        {pinnedChats.length > 0 && (
          <>
            <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pinned
            </h3>

            {pinnedChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                contact={chat}
                isActive={activeConversation === chat.id}
                onClick={() => handleSelectChat(chat)}
              />
            ))}
          </>
        )}

        {/* Recent */}

        <h3 className="mb-3 mt-6 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Recent
        </h3>

        {recentChats.map((chat) => (
          <ChatListItem
            key={chat.id}
            contact={chat}
            isActive={activeConversation === chat.id}
            onClick={() => handleSelectChat(chat)}
          />
        ))}

      </div>

    </aside>
  );
};

export default ChatSidebar;