import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Avatar } from "@/components/ui/Avatar";
import { removeConversation, toggleMuteConversation } from '@/store/slices/chatSlice';
import { chatService } from '@/services/chat.service';

const ChatHeader = ({ chat, conversationId }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewProfile = () => {
    setMenuOpen(false);
    if (chat.isGroup) navigate(`/group/${chat.id}/info`);
    else navigate(`/profile/${chat.otherUserId}`);
  };

  const handleMute = async () => {
    setMenuOpen(false);
    try {
      await chatService.toggleMute(chat.id);
      dispatch(toggleMuteConversation(chat.id));
      toast.success("Notifications muted");
    } catch {
      toast.error("Couldn't mute chat");
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm(`Delete chat with ${chat.name}?`)) return;
    try {
      await chatService.deleteConversation(chat.id);
      dispatch(removeConversation(chat.id));
      toast.success("Chat deleted");
    } catch {
      toast.error("Couldn't delete chat");
    }
  };

  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between border-b border-border bg-panel px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => { if (chat?.participant?.id && String(chat.participant.id) !== String(currentUser?.id)) setShowPreview(true); else alert('Profile not available for this conversation.'); }} className="rounded-full">
            <Avatar src={chat.avatar} fallback={chat.name?.substring(0, 2)} className="h-11 w-11" />
          </button>
          {chat.online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-panel bg-accent" />
          )}
        </div>

        <div>
          <h2 className="font-semibold text-foreground">{chat.name}</h2>
          <p className="text-xs text-muted-foreground">
            {chat.isGroup ? "Group" : chat.online ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="rounded-xl p-2 text-muted-foreground transition hover:bg-glass hover:text-foreground"
      >
        <MoreVertical size={20} />
      </button>

      {menuOpen && (
        <div ref={menuRef} className="absolute right-6 top-16 z-10 w-44 rounded-xl border border-border bg-panel py-2 shadow-lg">
          <button className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-glass" onClick={handleViewProfile}>
            View profile
          </button>
          <button className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-glass" onClick={handleMute}>
            Mute notifications
          </button>
          <button className="block w-full px-4 py-2 text-left text-sm text-rose-400 hover:bg-glass" onClick={handleDelete}>
            Delete chat
          </button>
        </div>
      )}

      {showPreview && chat?.participant?.id && (
      <ProfilePreviewModal userId={chat.participant.id} onClose={() => setShowPreview(false)} />
      )}    </header>
  );
};

export default ChatHeader;