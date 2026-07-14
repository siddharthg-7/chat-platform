import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import EmptyChat from "./EmptyChat";

import { chatService } from '@/services/chat.service';
import { setMessages, setConversations, setActiveConversation } from '@/store/slices/chatSlice';
import wsService from '@/services/websocket';

const ChatArea = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversation, onlineUsers } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  // Runs once per ChatArea mount/unmount — cleanly closes the socket when
  // the user navigates away from the Chat page entirely (e.g. to
  // Dashboard). Kept separate from the effect below so switching between
  // conversations doesn't trigger a full disconnect each time — connect()
  // already handles moving from one room to another internally.
  useEffect(() => {
    return () => {
      wsService.disconnect();
    };
  }, []);

  // Fetch messages + connect the WebSocket room whenever the active
  // conversation changes. This was missing before — switching chats cleared
  // `messages` in Redux (via setActiveConversation) but nothing ever
  // re-fetched them, and the socket never joined the new room, so real-time
  // updates silently stopped working until a full page refresh.
  useEffect(() => {
    if (!activeConversation) return;

    let cancelled = false;

    chatService.getMessages(activeConversation)
      .then((data) => {
        if (!cancelled) dispatch(setMessages(data));
      })
      .catch((err) => {
        console.error('[ChatArea] Failed to fetch messages:', err);
        toast.error('Could not load messages for this chat.');
      });

    wsService.connect(activeConversation);

    return () => {
      cancelled = true;
    };
  }, [activeConversation, dispatch]);

  if (!activeConversation) return <EmptyChat />;

  const chat = conversations.find(c => c.id === activeConversation);

  const otherParticipant = chat?.participants?.find(p => p.username !== user?.username) || chat?.participants?.[0];
  const contactName = chat?.is_group ? chat.name : (otherParticipant?.username || 'Unknown');
  const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant.id) : false;

  const mappedChat = {
    name: contactName,
    online: isOnline,
    avatar: null,
    isGroup: chat?.is_group || false,
  };

  const handleToggleMute = async () => {
    try {
      const updated = await chatService.toggleMute(activeConversation);
      // Merge the updated conversation (with new is_muted value) back into the list
      const next = conversations.map((c) =>
        c.id === activeConversation ? { ...c, is_muted: updated.is_muted } : c
      );
      dispatch(setConversations(next));
      toast.success(updated.is_muted ? 'Notifications muted' : 'Notifications unmuted');
    } catch (err) {
      console.error('[ChatArea] Failed to toggle mute:', err);
      toast.error('Could not update mute setting.');
    }
  };

  const handleDeleteChat = async () => {
    try {
      await chatService.deleteConversation(activeConversation);
      const next = conversations.filter((c) => c.id !== activeConversation);
      dispatch(setConversations(next));
      dispatch(setActiveConversation(null));
      toast.success('Chat deleted');
    } catch (err) {
      console.error('[ChatArea] Failed to delete chat:', err);
      toast.error('Could not delete this chat.');
    }
  };

  return (
    <section className="flex h-full w-full flex-col bg-base">
      <ChatHeader
        chat={mappedChat}
        muted={!!chat?.is_muted}
        onToggleMute={handleToggleMute}
        onDeleteChat={handleDeleteChat}
      />
      <ChatMessages />
      <MessageInput />
    </section>
  );
};

export default ChatArea;