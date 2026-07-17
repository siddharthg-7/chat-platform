import React, { useState, useEffect } from "react";
import { Search, Plus, Archive, Pin, Trash2, Mail, VolumeX, Volume2 } from "lucide-react";

import ChatListItem from "./ChatListItem";
import NewChatModal from "./NewChatModal";
import { useSelector, useDispatch } from 'react-redux';
import { setActiveConversation, setConversations } from '@/store/slices/chatSlice';
import { chatService } from '@/services/chat.service';
import { Input } from '@/components/ui/Input';

const ChatSidebar = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const dispatch = useDispatch();

  const { conversations, activeConversation, onlineUsers } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  const mappedChats = conversations
    .filter((chat) => {
      const otherParticipant = chat.participants?.find(p => p.username !== user?.username) || chat.participants?.[0];
      const contactName = chat.is_group ? chat.name : (otherParticipant?.username || 'Unknown');
      const matchesSearch = contactName.toLowerCase().includes(search.toLowerCase());

      if (filter === "archived") return matchesSearch && chat.is_archived;
      if (chat.is_archived) return false;

      if (filter === "groups") return matchesSearch && chat.is_group;
      if (filter === "unread") return matchesSearch && (chat.unread_count > 0 || chat.is_unread);
      return matchesSearch;
    })
    .map((chat) => {
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
        unread: chat.unread_count || 0,
        isPinned: chat.is_pinned,
        isArchived: chat.is_archived,
        isUnread: chat.is_unread,
        isMuted: chat.is_muted
      };
    });

  const pinnedChats = mappedChats.filter(c => c.isPinned);
  const recentChats = mappedChats.filter(c => !c.isPinned);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      chat
    });
    // Add haptic feedback if available on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleContextAction = async (action, chat) => {
    try {
      if (action === 'pin') {
        await chatService.togglePin(chat.id);
        dispatch({ type: 'chat/toggleConversationPin', payload: chat.id });
      } else if (action === 'archive') {
        await chatService.toggleArchive(chat.id);
        dispatch({ type: 'chat/toggleConversationArchive', payload: chat.id });
        if (activeConversation === chat.id) dispatch(setActiveConversation(null));
      } else if (action === 'unread') {
        await chatService.toggleUnread(chat.id);
        dispatch({ type: 'chat/toggleConversationUnread', payload: chat.id });
      } else if (action === 'mute') {
        await chatService.toggleMute(chat.id);
        dispatch({ type: 'chat/toggleMuteConversation', payload: chat.id });
      } else if (action === 'delete') {
        if (window.confirm("Delete this chat?")) {
          await chatService.deleteConversation(chat.id);
          dispatch({ type: 'chat/removeConversation', payload: chat.id });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectChat = (chat) => {
    dispatch(setActiveConversation(chat.id));
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const filterBtn = (key, label) => (
    <button
      onClick={() => setFilter(key)}
      className={`rounded-full px-4 py-1 text-xs font-medium transition ${
        filter === key
          ? "bg-accent text-white"
          : "bg-glass text-muted-foreground hover:bg-glass-hover"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <aside className="flex h-full flex-col bg-panel">
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Chats</h1>
            <button
              onClick={handleNewChat}
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-glass hover:text-foreground"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="relative mt-5">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="pl-11"
            />
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {filterBtn("all", "All")}
            {filterBtn("groups", "Groups")}
            {filterBtn("unread", "Unread")}
            {filterBtn("archived", "Archived")}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 custom-scrollbar">
          {pinnedChats.length > 0 && (
            <>
              <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pinned</h3>
              {pinnedChats.map((chat) => (
                <ChatListItem key={chat.id} contact={chat} isActive={activeConversation === chat.id} onClick={() => handleSelectChat(chat)} onContextMenu={(e) => handleContextMenu(e, chat)} />
              ))}
            </>
          )}

          {pinnedChats.length > 0 && <h3 className="mb-3 mt-6 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent</h3>}

          {recentChats.length === 0 ? (
            <p className="px-2 text-sm text-muted-foreground">No conversations found.</p>
          ) : (
            recentChats.map((chat) => (
              <ChatListItem key={chat.id} contact={chat} isActive={activeConversation === chat.id} onClick={() => handleSelectChat(chat)} onContextMenu={(e) => handleContextMenu(e, chat)} />
            ))
          )}
        </div>
      </aside>

      {/* WhatsApp-style Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 w-48 rounded-xl border border-border bg-panel py-1 shadow-2xl animate-scale-up"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => { handleContextAction('unread', contextMenu.chat); setContextMenu(null); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-foreground hover:bg-glass-hover transition-all"
          >
            <Mail className="h-4 w-4 text-muted-foreground" /> 
            {contextMenu.chat.isUnread ? 'Mark as Read' : 'Mark as Unread'}
          </button>
          
          <button 
            onClick={() => { handleContextAction('pin', contextMenu.chat); setContextMenu(null); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-foreground hover:bg-glass-hover transition-all"
          >
            <Pin className="h-4 w-4 text-muted-foreground" /> 
            {contextMenu.chat.isPinned ? 'Unpin Chat' : 'Pin Chat'}
          </button>
          
          <button 
            onClick={() => { handleContextAction('mute', contextMenu.chat); setContextMenu(null); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-foreground hover:bg-glass-hover transition-all"
          >
            {contextMenu.chat.isMuted ? (
              <><Volume2 className="h-4 w-4 text-muted-foreground" /> Unmute</>
            ) : (
              <><VolumeX className="h-4 w-4 text-muted-foreground" /> Mute</>
            )}
          </button>

          <button 
            onClick={() => { handleContextAction('archive', contextMenu.chat); setContextMenu(null); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-foreground hover:bg-glass-hover transition-all"
          >
            <Archive className="h-4 w-4 text-muted-foreground" /> 
            {contextMenu.chat.isArchived ? 'Unarchive Chat' : 'Archive Chat'}
          </button>

          <div className="my-1 border-t border-border" />

          <button 
            onClick={() => { handleContextAction('delete', contextMenu.chat); setContextMenu(null); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-red-500 hover:bg-red-50 hover:bg-opacity-5 dark:hover:bg-red-950 dark:hover:bg-opacity-20 transition-all"
          >
            <Trash2 className="h-4 w-4" /> Delete Chat
          </button>
        </div>
      )}

      {showNewChatModal && (
        <NewChatModal onClose={() => setShowNewChatModal(false)} />
      )}
    </>
  );
};

export default ChatSidebar;
