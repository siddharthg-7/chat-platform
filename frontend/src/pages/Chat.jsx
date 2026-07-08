import React, { useState } from 'react';
import { Search, MoreVertical, Paperclip, Send, Smile, Users, CheckCheck, Reply, MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';

const CONTACTS = [
  { id: 1, name: 'Engineering Team', lastMsg: 'Deploy successful to production.', time: '10:42 AM', unread: 3, online: true },
  { id: 2, name: 'Sarah Connor',     lastMsg: 'Are we still on for the meeting?', time: '09:15 AM', unread: 0, online: true },
  { id: 3, name: 'Design Sync',      lastMsg: 'Figma files have been updated.',  time: 'Yesterday', unread: 1, online: false },
  { id: 4, name: 'John Doe',         lastMsg: 'Thanks for the help earlier!',    time: 'Yesterday', unread: 0, online: false },
  { id: 5, name: 'Product Managers', lastMsg: 'Q3 roadmap is finalized.',        time: 'Monday',    unread: 0, online: false },
];

const MESSAGES = [
  { id: 1, type: 'in',  sender: 'John Doe',     senderColor: '#818cf8', text: 'Hey team! The new authentication microservice is deployed and stable. 🚀', time: '10:42 AM', reactions: ['👍', '🚀'] },
  { id: 2, type: 'out', sender: 'You',           senderColor: null,      text: "Awesome work! I'll start integrating the frontend JWT logic today.", time: '10:45 AM', reactions: [] },
  { id: 3, type: 'in',  sender: 'Sarah Connor',  senderColor: '#f472b6', text: "Don't forget to update the Swagger docs.", time: '10:50 AM', reactions: [] },
  { id: 4, type: 'out', sender: 'You',           senderColor: null,      text: 'Already on it! Will push the changes by EOD.', time: '10:52 AM', reactions: ['❤️'] },
  { id: 5, type: 'in',  sender: 'John Doe',     senderColor: '#818cf8', text: 'Perfect. Also, can someone review the PR for the new rate-limiter middleware?', time: '11:00 AM', reactions: [] },
];

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

/** Single message bubble */
const Message = ({ msg }) => {
  const [hovered, setHovered] = useState(false);
  const [reactions, setReactions] = useState(msg.reactions);
  const isOut = msg.type === 'out';

  const addReaction = (emoji) => {
    setReactions((prev) =>
      prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
    );
  };

  return (
    <div
      className={`flex gap-2 group ${isOut ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Message bubble */}
      <div className={`relative max-w-[65%] flex flex-col ${isOut ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isOut
              ? 'rounded-tr-sm bg-[var(--msg-out)] text-white shadow-[0_2px_12px_var(--accent-glow)]'
              : 'rounded-tl-sm bg-[var(--msg-in)] border border-[var(--border-subtle)] text-[var(--text)]'
          }`}
        >
          {!isOut && (
            <span className="text-[12px] font-semibold block mb-0.5" style={{ color: msg.senderColor }}>
              {msg.sender}
            </span>
          )}
          <span>{msg.text}</span>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <span className={`text-[10px] ${isOut ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>{msg.time}</span>
            {isOut && <CheckCheck className="h-3.5 w-3.5 text-white/80" />}
          </div>
        </div>


        {/* Reactions display */}
        {reactions.length > 0 && (
          <div className={`flex gap-1 mt-1 ${isOut ? 'justify-end' : 'justify-start'}`}>
            {reactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addReaction(emoji)}
                className="text-[13px] px-1.5 py-0.5 rounded-full bg-[var(--bg-glass)] border border-[var(--border)] hover:bg-[var(--bg-glass-hover)] transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover action toolbar */}
      <div className={`flex items-center self-center ${isOut ? 'mr-2 order-first' : 'ml-2'}`}>
        <AnimatePresence>
          {hovered && <MessageActions onReact={addReaction} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Chat = () => {
  const [activeContact, setActiveContact] = useState(0);
  const [inputVal, setInputVal] = useState('');

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
          {CONTACTS.map((contact, i) => (
            <div
              key={contact.id}
              onClick={() => setActiveContact(i)}
              className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-all duration-150 border-b border-[var(--border-subtle)] ${
                i === activeContact
                  ? 'bg-[var(--bg-glass-active)] border-l-2 border-l-[var(--accent)]'
                  : 'hover:bg-[var(--bg-glass)] border-l-2 border-l-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <Avatar
                  fallback={contact.name.substring(0, 2).toUpperCase()}
                  className="h-10 w-10 text-[11px]"
                />
                {contact.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--bg-panel)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[13.5px] font-medium text-[var(--text)] truncate">{contact.name}</span>
                  <span className={`text-[10.5px] shrink-0 ml-2 ${contact.unread > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                    {contact.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] truncate">{contact.lastMsg}</span>
                  {contact.unread > 0 && (
                    <span className="ml-2 shrink-0 h-4.5 min-w-[18px] rounded-full bg-[var(--accent)] text-white text-[9px] font-bold flex items-center justify-center px-1 shadow-[0_0_8px_var(--accent-glow)]">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Pane: Active Chat ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-[var(--border)] bg-[var(--bg-panel)]">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <Avatar fallback="ET" className="h-9 w-9 text-[11px]" />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-[var(--bg-panel)]" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--text)] group-hover:text-indigo-400 transition-colors">
                Engineering Team
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">John, Sarah, Design Sync, You</p>
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

          {MESSAGES.map((msg) => (
            <Message key={msg.id} msg={msg} />
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
              className="flex-1 bg-transparent border-none focus:outline-none text-[14px] text-[var(--text)] placeholder:text-[var(--text-muted)]"
            />
          </div>

          <button
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
