import React, { useState } from "react";
import { Search, Plus } from "lucide-react";

import ChatListItem from "./ChatListItem";
import { contacts } from "@/data/chatData";

const ChatSidebar = ({ selectedChat, onSelectChat }) => {
  const [search, setSearch] = useState("");

  const filteredChats = contacts.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedChats = filteredChats.filter((chat) => chat.id === 1);

  const recentChats = filteredChats.filter((chat) => chat.id !== 1);

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
                isActive={selectedChat?.id === chat.id}
                onClick={() => onSelectChat(chat)}
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
            isActive={selectedChat?.id === chat.id}
            onClick={() => onSelectChat(chat)}
          />
        ))}

      </div>

    </aside>
  );
};

export default ChatSidebar;