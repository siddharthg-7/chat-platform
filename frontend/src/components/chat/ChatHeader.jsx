import React, { useState, useRef, useEffect } from "react";
import { 
  MoreVertical, 
  Search, 
  User, 
  VolumeX, 
  Volume2, 
  Trash2, 
  Ban, 
  AlertTriangle, 
  Archive, 
  Pin, 
  Mail, 
  X,
  ShieldAlert,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Avatar } from "@/components/ui/Avatar";
import { removeConversation, toggleMuteConversation, setSearchQuery, setRightSidebar, setActiveConversation } from '@/store/slices/chatSlice';
import { chatService } from '@/services/chat.service';

const ChatHeader = ({ chat }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { conversations, searchQuery } = useSelector((state) => state.chat);
  const currentChat = conversations.find(c => c.id === chat.id);
  const isMuted = currentChat?.is_muted || false;

  // Track clicks outside menu to close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync search input focus
  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setLocalSearch(query);
    dispatch(setSearchQuery(query));
  };

  const handleSearchClose = () => {
    setSearchActive(false);
    setLocalSearch("");
    dispatch(setSearchQuery(""));
  };

  const handleViewProfile = () => {
    setMenuOpen(false);
    dispatch(setRightSidebar({
      open: true,
      type: chat.isGroup ? 'group_info' : 'profile'
    }));
  };

  const handleMute = async () => {
    setMenuOpen(false);
    try {
      await chatService.toggleMute(chat.id);
      dispatch(toggleMuteConversation(chat.id));
      toast.success(isMuted ? "Chat unmuted" : "Chat muted");
    } catch {
      toast.error("Couldn't toggle mute status");
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm(`Are you sure you want to delete this chat with ${chat.name}?`)) return;
    try {
      await chatService.deleteConversation(chat.id);
      dispatch(removeConversation(chat.id));
      toast.success("Chat deleted successfully");
    } catch {
      toast.error("Couldn't delete chat");
    }
  };

  const handleBlockUser = () => {
    setMenuOpen(false);
    toast.success(`${chat.name} has been blocked.`);
  };

  const handleReportUser = () => {
    setMenuOpen(false);
    toast.success("Conversation reported successfully. Thank you!");
  };

  const handleArchiveChat = () => {
    setMenuOpen(false);
    toast.success("Chat archived.");
  };

  const handlePinChat = () => {
    setMenuOpen(false);
    toast.success("Chat pinned to top.");
  };

  const handleMarkAsUnread = () => {
    setMenuOpen(false);
    toast.success("Conversation marked as unread.");
  };

  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-panel)] px-6 shadow-sm z-20">
      
      {/* Search Header Mode */}
      {searchActive ? (
        <div className="flex-1 flex items-center gap-3 animate-fade-in">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search messages in this chat..."
            value={localSearch}
            onChange={handleSearchChange}
            className="flex-1 bg-transparent border-none text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <button 
            onClick={handleSearchClose}
            className="p-1 hover:bg-[var(--bg-glass-hover)] rounded-full transition"
          >
            <X className="h-4.5 w-4.5 text-[var(--text-muted)]" />
          </button>
        </div>
      ) : (
        // Standard Header Mode
        <>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => dispatch(setActiveConversation(null))}
              className="md:hidden p-2 -ml-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-glass-hover)] transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleViewProfile}>
            <div className="relative">
              <Avatar src={chat.avatar} fallback={chat.name.substring(0, 2)} className="h-11 w-11 border border-[var(--border)]" />
              {chat.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--bg-panel)] bg-[var(--accent)]" />
              )}
            </div>

            <div>
              <h2 className="font-semibold text-sm text-[var(--text)]">{chat.name}</h2>
              <p className="text-xs text-[var(--text-muted)]">
                {chat.isGroup ? "Group Chat" : chat.online ? "Online" : "Offline"}
              </p>
            </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search messages button */}
            <button
              onClick={() => setSearchActive(true)}
              className="rounded-xl p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text)]"
            >
              <Search size={18} />
            </button>

            {/* Three dot actions dropdown */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-xl p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text)]"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </>
      )}

      {/* Menu Options Popover */}
      {menuOpen && (
        <div 
          ref={menuRef} 
          className="absolute right-6 top-14 z-50 w-52 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] py-1.5 shadow-xl animate-scale-up"
        >
          <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[var(--text)] hover:bg-[var(--bg-glass-hover)] transition-all" onClick={handleViewProfile}>
            <User className="h-4 w-4 text-[var(--text-muted)]" /> View Profile
          </button>
          
          <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[var(--text)] hover:bg-[var(--bg-glass-hover)] transition-all" onClick={handleMute}>
            {isMuted ? (
              <>
                <Volume2 className="h-4 w-4 text-[var(--text-muted)]" /> Unmute Notifications
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-[var(--text-muted)]" /> Mute Notifications
              </>
            )}
          </button>

          <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[var(--text)] hover:bg-[var(--bg-glass-hover)] transition-all" onClick={handlePinChat}>
            <Pin className="h-4 w-4 text-[var(--text-muted)]" /> Pin Chat
          </button>

          <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[var(--text)] hover:bg-[var(--bg-glass-hover)] transition-all" onClick={handleArchiveChat}>
            <Archive className="h-4 w-4 text-[var(--text-muted)]" /> Archive Chat
          </button>

          <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[var(--text)] hover:bg-[var(--bg-glass-hover)] transition-all" onClick={handleMarkAsUnread}>
            <Mail className="h-4 w-4 text-[var(--text-muted)]" /> Mark as Unread
          </button>

          <div className="my-1 border-t border-[var(--border)]" />

          <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[var(--text)] hover:bg-[var(--bg-glass-hover)] transition-all" onClick={handleBlockUser}>
            <Ban className="h-4 w-4 text-[var(--text-muted)]" /> Block User
          </button>

          <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-[var(--text)] hover:bg-[var(--bg-glass-hover)] transition-all" onClick={handleReportUser}>
            <ShieldAlert className="h-4 w-4 text-[var(--text-muted)]" /> Report Chat
          </button>

          <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-red-500 hover:bg-red-50 hover:bg-opacity-5 dark:hover:bg-red-950 dark:hover:bg-opacity-20 transition-all" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" /> Delete Chat
          </button>
        </div>
      )}
    </header>
  );
};

export default ChatHeader;
