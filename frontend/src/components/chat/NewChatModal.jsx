import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Loader2, Users, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { chatService } from '@/services/chat.service';
import { setConversations, setActiveConversation } from '@/store/slices/chatSlice';

const NewChatModal = ({ onClose }) => {
  const [mode, setMode] = useState('direct');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(null);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  const dispatch = useDispatch();
  const { conversations } = useSelector((state) => state.chat);

  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await chatService.searchUsers(query.trim());
        setResults(data);
      } catch (err) {
        console.error('[NewChatModal] search error', err);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [query]);

  const handleSelectUser = async (user) => {
    if (mode === 'group') {
      setSelectedUsers((prev) =>
        prev.some((u) => u.id === user.id)
          ? prev.filter((u) => u.id !== user.id)
          : [...prev, user]
      );
      return;
    }

    if (creating) return;

    const existing = conversations.find((c) =>
      !c.is_group && c.participants?.some((p) => p.id === user.id)
    );
    if (existing) {
      dispatch(setActiveConversation(existing.id));
      onClose();
      return;
    }

    setCreating(user.id);
    try {
      const newConv = await chatService.createConversation(user.id);
      dispatch(setConversations([...conversations, newConv]));
      dispatch(setActiveConversation(newConv.id));
      onClose();
    } catch (err) {
      console.error('[NewChatModal] createConversation error', err);
      toast.error('Could not start chat. Please try again.');
    } finally {
      setCreating(null);
    }
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.length < 2) {
      toast.error("Select at least 2 people for a group");
      return;
    }
    if (!groupName.trim()) {
      toast.error("Give your group a name");
      return;
    }
    setCreatingGroup(true);
    try {
      const newGroup = await chatService.createGroup({
        name: groupName.trim(),
        member_ids: selectedUsers.map((u) => u.id),
      });
      dispatch(setConversations([...conversations, newGroup]));
      dispatch(setActiveConversation(newGroup.id));
      toast.success("Group created!");
      onClose();
    } catch (err) {
      console.error('[NewChatModal] createGroup error', err);
      toast.error('Could not create group. Please try again.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mx-4 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">
              {mode === 'direct' ? 'New Conversation' : 'New Group'}
            </h2>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-2 px-4 pt-4">
            <button
              onClick={() => setMode('direct')}
              className={`flex-1 rounded-xl py-2 text-xs font-medium transition ${mode === 'direct' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Direct Message
            </button>
            <button
              onClick={() => setMode('group')}
              className={`flex-1 rounded-xl py-2 text-xs font-medium transition flex items-center justify-center gap-1.5 ${mode === 'group' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              <Users size={13} /> Group
            </button>
          </div>

          {mode === 'group' && (
            <div className="px-4 pt-3">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name…"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-500"
              />
            </div>
          )}

          {mode === 'group' && selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {selectedUsers.map((u) => (
                <span key={u.id} className="flex items-center gap-1 rounded-full bg-emerald-600/20 text-emerald-400 text-xs px-2.5 py-1">
                  {u.username}
                  <X size={12} className="cursor-pointer" onClick={() => setSelectedUsers((prev) => prev.filter((x) => x.id !== u.id))} />
                </span>
              ))}
            </div>
          )}

          <div className="px-4 pt-4">
            <div className="relative">
              {searching ? (
                <Loader2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
              ) : (
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by username…"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="px-4 py-3 min-h-[120px] max-h-72 overflow-y-auto">
            {results.length === 0 && !searching && query.trim() && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                <User size={28} className="mb-2 opacity-40" />
                <p className="text-sm">No users found for "{query}"</p>
              </div>
            )}

            {results.length === 0 && !query.trim() && (
              <p className="text-center text-sm text-slate-600 py-8">Type a username to search</p>
            )}

            {results.map((user) => {
              const isSelected = selectedUsers.some((u) => u.id === user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  disabled={creating === user.id}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-800 disabled:opacity-60"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.username}</p>
                    {(user.first_name || user.last_name) && (
                      <p className="text-xs text-slate-400 truncate">
                        {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                      </p>
                    )}
                  </div>

                  {mode === 'group' ? (
                    isSelected && <Check size={16} className="shrink-0 text-emerald-500" />
                  ) : creating === user.id ? (
                    <Loader2 size={15} className="shrink-0 animate-spin text-emerald-500" />
                  ) : (
                    <span className="shrink-0 text-xs text-slate-500">Chat</span>
                  )}
                </button>
              );
            })}
          </div>

          {mode === 'group' && (
            <div className="px-4 pb-4">
              <button
                onClick={handleCreateGroup}
                disabled={creatingGroup || selectedUsers.length < 2 || !groupName.trim()}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingGroup ? <Loader2 size={15} className="animate-spin" /> : <Users size={15} />}
                Create Group ({selectedUsers.length} selected)
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NewChatModal;
