import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, MoreVertical, Paperclip, Send, Smile, Users, CheckCheck, Reply, MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../services/chat.service';
import wsService from '../services/websocket';
import { setConversations, setMessages, setActiveConversation } from '../store/slices/chatSlice';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🚀'];

/** Floating toolbar that appears on message hover */
const MessageActions = ({ onReact }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85, y: 4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.85, y: 4 }}
    transition={{ duration: 0.15, ease: 'easeOut' }}
    className="flex items-center gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-[0_8px_32px_rgba(0,0,0,0.15)] px-1.5 py-1"
  >
    {EMOJI_REACTIONS.map((emoji) => (
      <button
        key={emoji}
        onClick={() => onReact(emoji)}
        className="text-[16px] rounded-lg px-1.5 py-0.5 hover:bg-[var(--bg-glass-hover)] transition-colors cursor-pointer"
      >
        {emoji}
      </button>
    ))}
    <div className="w-px h-4 bg-[var(--border)] mx-1" />
    <button className="flex items-center justify-center p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-glass-hover)] transition-colors cursor-pointer">
      <Reply size={14} />
    </button>
    <button className="flex items-center justify-center p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-glass-hover)] transition-colors cursor-pointer">
      <MoreHorizontal size={14} />
    </button>
  </motion.div>
);

const Message = ({ msg, currentUsername }) => {
  const [hovered, setHovered] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [reactions, setReactions] = useState([]);
  
  // msg.sender might be an ID or an object. Let's assume the API returns sender details.
  const senderName = msg.sender?.username || 'Unknown';
  const isOut = senderName === currentUsername;
  
  const toolbarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setShowToolbar(false);
      }
    };
    
    if (showToolbar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToolbar]);

  const addReaction = (emoji) => {
    setReactions((prev) =>
      prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
    );
    setShowToolbar(false);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    // Let the toolbar stay open until click outside
  };

  return (
    <div
      className={`flex gap-2 group ${isOut ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Message bubble */}
      <div className={`relative max-w-[65%] flex flex-col ${isOut ? 'items-end' : 'items-start'}`}>
        
        {/* Hover action toolbar (absolute to overlap on top) */}
        <div ref={toolbarRef} className={`absolute -top-11 ${isOut ? 'right-0' : 'left-0'} z-30`}>
          <AnimatePresence>
            {showToolbar && <MessageActions onReact={addReaction} />}
          </AnimatePresence>
        </div>

        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isOut
              ? 'rounded-tr-sm bg-[var(--msg-out)] text-white shadow-[0_2px_12px_var(--accent-glow)]'
              : 'rounded-tl-sm bg-[var(--msg-in)] border border-[var(--border-subtle)] text-[var(--text)]'
          }`}
        >
          {!isOut && (
            <span className="text-[12px] font-semibold block mb-0.5" style={{ color: '#818cf8' }}>
              {senderName}
            </span>
          )}
          <span>{msg.text}</span>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <span className={`text-[10px] ${isOut ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isOut && <CheckCheck className={`h-3.5 w-3.5 ${msg.is_read ? 'text-blue-400' : 'text-white/80'}`} />}
          </div>
        </div>


        {/* The hover prompt/trigger (appears under the message on hover) */}
        <AnimatePresence>
          {hovered && !showToolbar && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute -bottom-3.5 ${isOut ? 'left-2' : 'right-2'} z-20`}
            >
               <button
                 onClick={(e) => { e.stopPropagation(); setShowToolbar(true); }}
                 className="flex items-center justify-center bg-[var(--bg-panel)] border border-[var(--border-subtle)] shadow-sm rounded-full w-6 h-6 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-glass-hover)] transition-all"
               >
                 <Smile size={12} />
               </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reactions display */}
        {reactions.length > 0 && (
          <div className={`absolute -bottom-3.5 ${isOut ? 'right-2' : 'left-2'} flex gap-1 z-10`}>
            {reactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addReaction(emoji)}
                className="text-[12px] px-1.5 py-0.5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:bg-[var(--bg-glass-hover)] transition-colors shadow-sm leading-none flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Chat = () => {
  const dispatch = useDispatch();
  const { conversations, messages, activeConversation, onlineUsers } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [inputVal, setInputVal] = useState('');

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

  const handleSend = async () => {
    if (!inputVal.trim() || !activeConversation) return;
    try {
      await chatService.sendMessage(activeConversation, inputVal);
      setInputVal('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden text-[var(--text)]">

      {/* ── Left Pane: Contact List ── */}
      <div className="w-[300px] xl:w-[340px] flex-shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--bg-panel)]">

        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[15px] text-[var(--text)]">Messages</h2>
          <div className="flex items-center gap-3 text-[var(--text-muted)]">
            <button className="hover:text-[var(--text)] transition-colors"><Users size={17} /></button>
            <button className="hover:text-[var(--text)] transition-colors"><MoreVertical size={17} /></button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5 bg-[var(--bg-glass)] rounded-lg px-3 py-2 border border-[var(--border)] focus-within:border-[var(--border-active)] transition-colors">
            <Search className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
            <input
              type="text"
              placeholder="Search conversations…"
              className="flex-1 bg-transparent border-none focus:outline-none text-[13px] text-[var(--text)] placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.map((contact) => {
            // Find the other participant's name
            const otherParticipant = contact.participants?.find(p => p.username !== user?.username) || contact.participants?.[0];
            const contactName = contact.is_group ? contact.name : (otherParticipant?.username || 'Unknown');
            const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant.id) : false;
            
            return (
            <div
              key={contact.id}
              onClick={() => dispatch(setActiveConversation(contact.id))}
              className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-all duration-150 border-b border-[var(--border-subtle)] ${
                contact.id === activeConversation
                  ? 'bg-[var(--bg-glass-active)] border-l-2 border-l-[var(--accent)]'
                  : 'hover:bg-[var(--bg-glass)] border-l-2 border-l-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <Avatar
                  fallback={contactName.substring(0, 2).toUpperCase()}
                  className="h-10 w-10 text-[11px]"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--bg-panel)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[13.5px] font-medium text-[var(--text)] truncate">{contactName}</span>
                  <span className={`text-[10.5px] shrink-0 ml-2 text-[var(--text-muted)]`}>
                    {contact.last_message ? new Date(contact.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] truncate">
                    {contact.last_message?.text || 'No messages yet'}
                  </span>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>

      {/* ── Right Pane: Active Chat ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-[var(--border)] bg-[var(--bg-panel)]">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <Avatar fallback="CH" className="h-9 w-9 text-[11px]" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--text)] group-hover:text-indigo-400 transition-colors">
                Chat
              </h3>
            </div>
          </div>
            <div className="flex items-center gap-4 text-[var(--text-muted)]">
               <button className="hover:text-[var(--text)] transition-colors">
                 <Search size={18} />
               </button>
               <button className="hover:text-[var(--text)] transition-colors">
                  <MoreVertical size={18} />
               </button>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3 chat-bg-pattern">
          {/* Date separator */}
          <div className="flex justify-center mb-4">
            <span className="text-[11px] font-medium text-[var(--text-muted)] bg-[rgba(255,255,255,0.05)] border border-[var(--border)] px-3 py-1 rounded-full uppercase tracking-wider">
              Today
            </span>
          </div>

          {messages.map((msg) => (
            <Message key={msg.id} msg={msg} currentUsername={user?.username} />
          ))}
        </div>

        {/* Input Footer */}
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-panel)] flex items-center gap-3">
          <button className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shrink-0">
            <Smile size={20} />
          </button>
          <button className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shrink-0">
            <Paperclip size={18} />
          </button>

          <div className="flex-1 bg-[var(--bg-glass)] border border-[var(--border)] rounded-xl px-4 py-2 flex items-center focus-within:border-[var(--border-active)] transition-colors">
            <input
              type="text"
              placeholder="Type a message…"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-1 bg-transparent border-none focus:outline-none text-[14px] text-[var(--text)] placeholder:text-[var(--text-muted)]"
            />
          </div>

          <button
            onClick={handleSend}
            className={`shrink-0 flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200 ${
              inputVal.trim()
                ? 'bg-[var(--accent)] text-white shadow-[0_0_16px_var(--accent-glow)] hover:bg-[var(--accent-hover)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
