import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import Loader from '@/components/ui/Loader';
import { Camera, Mail, Calendar, AlertCircle, CheckCircle, Loader2, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';
import { updateProfile } from '../store/slices/authSlice';

const DEFAULT_COVER_GRADIENT = 'linear-gradient(to bottom right, #10b981, #047857, #064e3b)';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--bg-surface)]">
        <Loader size="lg" />
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedUser = await authService.updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
      });

      const formData = new FormData();
      formData.append('bio', form.bio.trim());
      const updatedProfileDetails = await authService.updateProfileDetails(formData);

      dispatch(updateProfile({
        ...updatedUser,
        profile: {
          ...user.profile,
          ...updatedProfileDetails
        }
      }));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        'Failed to save profile. Please check your input.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      bio: user.profile?.bio || '',
    });
    setError(null);
    setSuccess(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const updatedProfileDetails = await authService.updateProfileDetails(formData);
      dispatch(updateProfile({
        profile: {
          ...user.profile,
          ...updatedProfileDetails
        }
      }));
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      alert('Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
    }
  };

  const getAvatarUrl = () => {
    if (user.profile?.avatar) {
      return user.profile.avatar.startsWith('http')
        ? user.profile.avatar
        : `${import.meta.env.VITE_API_URL || ''}${user.profile.avatar}`;
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-surface)]">
      <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-8">

        {/* Banner & Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div className="h-52 w-full rounded-2xl overflow-hidden relative">
            <div
              className="absolute inset-0"
              style={{ background: DEFAULT_COVER_GRADIENT }}
            />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.10) 0%, transparent 50%)',
              }}
            />
          </div>

          <div className="absolute -bottom-14 left-6 flex items-end gap-4">
            <div className="relative">
              <Avatar
                src={getAvatarUrl()}
                fallback={user.username.substring(0, 2).toUpperCase()}
                className="h-28 w-28 border-4 border-[var(--bg-surface)] shadow-md bg-[var(--accent)] font-bold text-white text-xl"
              />
              <Button
                size="icon"
                type="button"
                disabled={uploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full text-xs shadow-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] border border-[var(--border)]"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </Button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="mb-0">
              <h1 className="text-xl font-bold text-white">
                {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}
              </h1>
              <p className="text-sm text-[var(--text-muted)]">@{user.username}</p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">

          {/* Left: Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-black dark:text-white">About Me</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed min-h-[40px]">
                  {user.profile?.bio || "No bio added yet."}
                </p>
                <div className="space-y-2.5 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2.5 text-[13px] text-[var(--text-muted)]">
                    <Mail className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                    <span className="truncate">{user.email || 'No email address'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] text-[var(--text-muted)]">
                    <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                    <span>Member since {user.created_at ? new Date(user.created_at).toLocaleDateString([], { month: 'long', year: 'numeric' }) : '2026'}</span>
                  </div>
                </div>

                {/* Logout Button */}
                <Button
                  variant="destructive"
                  className="w-full mt-4 gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Edit Form */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information and biography.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSave}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">First Name</label>
                      <Input
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Last Name</label>
                      <Input
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Bio</label>
                    <textarea
                      placeholder="Tell us about yourself…"
                      className="flex min-h-[100px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-glass)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] focus:ring-1 focus:ring-[var(--accent)] transition-all duration-200 custom-scrollbar resize-none"
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      maxLength={500}
                    />
                    <div className="flex justify-end text-[10px] text-[var(--text-muted)]">
                      {form.bio.length} / 500 characters
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-500">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-400">
                      <CheckCircle size={16} className="shrink-0" />
                      <span>Profile updated successfully!</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                    <Button variant="outline" type="button" onClick={handleCancel} disabled={saving}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;