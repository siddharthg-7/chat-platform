import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { chatService } from '@/services/chat.service';
import { prependMessages } from '@/store/slices/chatSlice';
import MessageBubble from "./MessageBubble";
import { Loader2 } from "lucide-react";

const getGroupDateString = (dateStr) => {
  if (!dateStr) return "Today";
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  }
};

const ChatMessages = ({ messagesLoading }) => {
  const dispatch = useDispatch();
  const { messages, conversations, activeConversation, typingUsers, nextCursor, searchQuery } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto scroll to bottom
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom on initial load or new message
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom("auto");
    }
  }, [messages, typingUsers, shouldAutoScroll]);

  // Handle container scroll for pagination & tracking scroll pos
  const handleScroll = async () => {
    const container = containerRef.current;
    if (!container) return;

    // If scrolled to top, fetch older messages
    if (container.scrollTop === 0 && nextCursor && !loadingOlder && !messagesLoading) {
      setLoadingOlder(true);
      const oldScrollHeight = container.scrollHeight;

      try {
        const data = await chatService.getMessages(activeConversation, nextCursor);
        
        // Disable auto-scroll temporarily to retain position
        setShouldAutoScroll(false);

        dispatch(prependMessages({
          messages: data.messages,
          nextCursor: data.nextCursor
        }));

        // Adjust scroll position to prevent jumping
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight - oldScrollHeight;
            setLoadingOlder(false);
          }
        }, 50);

      } catch (err) {
        console.error("Failed to load older messages:", err);
        setLoadingOlder(false);
      }
    }

    // Check if user is near bottom
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    setShouldAutoScroll(isAtBottom);
  };

  const chat = conversations.find(c => c.id === activeConversation);
  const typingParticipants = chat?.participants?.filter(
    p => (typingUsers[activeConversation] || []).includes(p.id) && p.username !== user?.username
  ) || [];

  // Filter messages based on search query
  const filteredMessages = messages.filter(msg => {
    if (msg.deleted_for_users?.includes(user?.id)) return false; // Delete for me
    if (!searchQuery.trim()) return true;
    return msg.text?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Group messages by date
  const groupedMessages = [];
  let currentDateGroup = null;

  filteredMessages.forEach((msg) => {
    const dateStr = getGroupDateString(msg.created_at);
    if (dateStr !== currentDateGroup) {
      currentDateGroup = dateStr;
      groupedMessages.push({ type: 'date', label: dateStr, id: `date-${msg.id}` });
    }
    groupedMessages.push({ type: 'message', data: msg, id: msg.id });
  });

  return (
    <div 
      ref={containerRef} 
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-[var(--bg-surface)] custom-scrollbar"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6 min-h-full justify-end">
        {/* Loading Indicator for Older Messages */}
        {loadingOlder && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
          </div>
        )}

        {/* Loading Spinner for Chat Swap */}
        {messagesLoading && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] mb-3" />
            <span className="text-sm">Loading messages…</span>
          </div>
        )}

        {/* Empty Chat State */}
        {!messagesLoading && groupedMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-20 text-[var(--text-muted)] text-sm">
            {searchQuery ? "No messages match your search." : "No messages yet — say hello!"}
          </div>
        )}

        {/* Render Pinned Messages Panel at Top if Pinned Messages Exist */}
        {chat?.is_group && messages.filter(m => m.is_pinned).length > 0 && (
          <div className="rounded-xl bg-[var(--bg-glass)] border border-[var(--border)] p-3 mb-2 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">📌 Pinned Messages</span>
            <div className="max-h-20 overflow-y-auto custom-scrollbar flex flex-col gap-1">
              {messages.filter(m => m.is_pinned).map(m => (
                <div key={`pin-${m.id}`} className="text-xs truncate text-[var(--text)] flex items-center gap-1.5 cursor-pointer" onClick={() => {
                  setShouldAutoScroll(false);
                  const el = document.getElementById(`msg-${m.id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el?.classList.add('highlight-flash');
                  setTimeout(() => el?.classList.remove('highlight-flash'), 2000);
                }}>
                  <span className="font-semibold">{m.sender?.username}:</span>
                  <span className="text-[var(--text-muted)]">{m.text || "Attachment"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages List */}
        {groupedMessages.map((item) => {
          if (item.type === 'date') {
            return (
              <div key={item.id} className="flex justify-center my-2">
                <span className="rounded-full bg-[var(--bg-glass)] border border-[var(--border)] px-4 py-1 text-xs text-[var(--text-muted)] shadow-sm">
                  {item.label}
                </span>
              </div>
            );
          }

          const msg = item.data;
          let senderName = msg.sender?.username;
          if (!senderName) {
            const participant = chat?.participants?.find(p => p.id === msg.sender?.id);
            senderName = participant?.username || (msg.sender?.id === user?.id ? user?.username : 'Unknown');
          }

          const isIncoming = senderName !== user?.username;

          const formattedMessage = {
            id: msg.id,
            text: msg.text,
            sender: senderName,
            senderId: msg.sender?.id,
            incoming: isIncoming,
            time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            read: msg.is_read,
            delivered: msg.is_delivered,
            attachments: msg.attachments || [],
            reactions: msg.reactions || [],
            reply_to: msg.reply_to,
            voice_note: msg.voice_note,
            is_edited: msg.is_edited,
            is_pinned: msg.is_pinned,
          };

          return (
            <div id={`msg-${msg.id}`} key={msg.id} className="transition-all duration-300">
              <MessageBubble message={formattedMessage} />
            </div>
          );
        })}

        {/* Typing Indicators */}
        {typingParticipants.length > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-1 text-xs text-[var(--text-muted)] italic">
            <span className="font-semibold text-[var(--accent)]">
              {typingParticipants.map(p => p.username).join(', ')}
            </span>{" "}
            {typingParticipants.length === 1 ? 'is' : 'are'} typing
            <span className="flex gap-0.5 ml-1 items-center">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)]" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
