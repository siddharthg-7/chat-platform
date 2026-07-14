import React, { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useNavigate } from 'react-router-dom';
import { chatService } from '../../services/chat.service';
import { useDispatch, useSelector } from 'react-redux';
import { setConversations, setActiveConversation, setMutedConversations, addMutedConversation, removeMutedConversation } from '@/store/slices/chatSlice';
import ProfilePreviewModal from './ProfilePreviewModal';

const ChatHeader = ({ chat, conversationId }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Load muted conversations from server
    let mounted = true;
    (async () => {
      try {
        const muted = await chatService.getMutedConversations();
        if (!mounted) return;
        setMuted(muted.includes(conversationId));
        // update global store maybe used elsewhere
        dispatch(setMutedConversations(muted));
      } catch (err) {
        console.error('Failed to load muted conversations', err);
        // fallback to localStorage
        const mutedList = JSON.parse(localStorage.getItem('muted_conversations') || '[]');
        if (mounted) setMuted(mutedList.includes(conversationId));
      }
    })();
    return () => { mounted = false };
  }, [conversationId, dispatch]);

  const { user: currentUser } = useSelector(state => state.auth);

  const handleViewProfile = () => {
    setMenuOpen(false);
    // If participant info is not present, disable navigation to avoid linking to current user's profile by mistake
    const participant = chat?.participant;
    if (!participant || !participant.id) {
      // Option chosen: disable and inform the user rather than navigating to their own profile
      alert('Profile not available for this conversation.');
      return;
    }

    // Prevent navigating to own profile when the participant reference is missing or incorrect
    if (String(participant.id) === String(currentUser?.id)) {
      alert('Participant profile not available.');
      return;
    }

    // Navigate to profile page and pass the participant in state so Profile can render it
    navigate('/profile', { state: { user: participant } });
  };

  const handleToggleMute = async () => {
    setMenuOpen(false);
    if (!conversationId) return;
    try {
      if (muted) {
        await chatService.unmuteConversation(conversationId);
        dispatch(removeMutedConversation(conversationId));
        setMuted(false);
      } else {
        await chatService.muteConversation(conversationId);
        dispatch(addMutedConversation(conversationId));
        setMuted(true);
      }
    } catch (err) {
      console.error('Failed to toggle mute', err);
      alert('Failed to update mute setting');
    }
  };

  const handleDeleteChat = async () => {
    setMenuOpen(false);
    if (!conversationId) return;
    if (!confirm('Delete this conversation? This cannot be undone.')) return;

    try {
      await chatService.deleteConversation(conversationId);
      // Refresh conversation list
      const convs = await chatService.getConversations();
      dispatch(setConversations(convs));
      dispatch(setActiveConversation(convs.length ? convs[0].id : null));
    } catch (err) {
      console.error('Failed to delete conversation', err);
      alert('Failed to delete conversation');
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
          <button onClick={() => { if (chat?.participant?.id && String(chat.participant.id) !== String(currentUser?.id)) setShowPreview(true); else alert('Profile not available for this conversation.'); }} className="text-left">
            <h2 className="font-semibold text-foreground">{chat.name}</h2>
            <p className="text-xs text-muted-foreground">
              {chat.isGroup ? "Group" : chat.online ? "Online" : "Offline"}
            </p>
          </button>
        </div>
      </div>

      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="rounded-xl p-2 text-muted-foreground transition hover:bg-glass hover:text-foreground"
      >
        <MoreVertical size={20} />
      </button>

      {menuOpen && (
        <div className="absolute right-6 top-16 z-10 w-44 rounded-xl border border-border bg-panel py-2 shadow-lg">
          <button
            className={`block w-full px-4 py-2 text-left text-sm ${(!chat?.participant || String(chat?.participant?.id) === String(currentUser?.id)) ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground hover:bg-glass'}`}
            onClick={handleViewProfile}
            disabled={!chat?.participant || String(chat?.participant?.id) === String(currentUser?.id)}
          >
            View profile
          </button>
          <button className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-glass" onClick={handleToggleMute}>
            {muted ? 'Unmute notifications' : 'Mute notifications'}
          </button>
          <button className="block w-full px-4 py-2 text-left text-sm text-rose-400 hover:bg-glass" onClick={handleDeleteChat}>
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