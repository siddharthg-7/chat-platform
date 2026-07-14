import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatService } from '@/services/chat.service';
import { Avatar } from '@/components/ui/Avatar';


const ProfilePreviewModal = ({ userId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setUser(null);
    (async () => {
      try {
        const data = await chatService.getUser(userId);
        if (!mounted) return;
        setUser(data);
      } catch (err) {
        if (!mounted) return;
        if (err.response && err.response.status === 404) {
          setError('not_found');
        } else {
          setError('failed');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [userId]);

  const handleViewFull = () => {
    // Navigate to full profile page passing the fetched user so it can render immediately
    navigate('/profile', { state: { user } });
    onClose();
  };

  const content = () => {
    if (loading) return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

    if (error === 'not_found') return (
      <div className="p-6">
        <p className="text-sm text-slate-400">Profile not found.</p>
      </div>
    );

    if (error) return (
      <div className="p-6">
        <p className="text-sm text-slate-400">Failed to load profile.</p>
      </div>
    );

    // Short card
    return (
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.profile?.avatar ? (user.profile.avatar.startsWith('http') ? user.profile.avatar : `${import.meta.env.VITE_API_URL || ''}${user.profile.avatar}`) : null} fallback={user.username?.substring(0,2).toUpperCase()} className="h-14 w-14" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}</p>
            <p className="text-xs text-slate-400 truncate">@{user.username}</p>
            <p className="mt-2 text-xs text-slate-400 line-clamp-3">{user.profile?.bio || 'No bio provided.'}</p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={handleViewFull} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:opacity-90 flex items-center gap-2">
            View complete profile <ExternalLink size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-sm mx-4 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden"
        >
          {content()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProfilePreviewModal;