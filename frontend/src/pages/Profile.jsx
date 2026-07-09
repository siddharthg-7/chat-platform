import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Camera, MapPin, Link as LinkIcon, Mail, Briefcase, Calendar, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext';

const DEFAULT_COVER_GRADIENT = 'linear-gradient(to bottom right, #4f46e5, #9333ea, #1d4ed8)';

const Profile = () => {
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...profile });
  const [savedFlash, setSavedFlash] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ ...form });
    setSavedFlash(true);
    navigate('/'); // Dashboard is at root path "/"
  };

  const handleCancel = () => {
    setForm({ ...profile });
  };

  const readFileAsDataUrl = (file, onLoad) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onLoad(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAvatarChange = (e) => {
    readFileAsDataUrl(e.target.files?.[0], (url) => {
      setForm((f) => ({ ...f, avatarUrl: url }));
      updateProfile({ avatarUrl: url });
    });
    e.target.value = '';
  };

  const handleCoverChange = (e) => {
    readFileAsDataUrl(e.target.files?.[0], (url) => {
      setForm((f) => ({ ...f, coverUrl: url }));
      updateProfile({ coverUrl: url });
    });
    e.target.value = '';
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
            {form.coverUrl ? (
              <img
                src={form.coverUrl}
                alt="Profile cover"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: DEFAULT_COVER_GRADIENT }}
              />
            )}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.10) 0%, transparent 50%)',
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 glass border-white/20 hover:border-white/40 text-xs text-foreground"
            >
              <Camera className="h-3.5 w-3.5 mr-1.5" /> Change Cover
            </Button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>

          <div className="absolute -bottom-14 left-6 flex items-end gap-4">
            <div className="relative">
              <Avatar
                src={form.avatarUrl}
                fallback={`${form.firstName?.[0] ?? ''}${form.lastName?.[0] ?? ''}`.toUpperCase()}
                className="h-28 w-28 border-4 border-[var(--bg-surface)] shadow-md"
              />
              <Button
                size="icon"
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full text-xs shadow-md"
              >
                <Camera className="h-3.5 w-3.5" />
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
              <h1 className="text-xl font-bold text-foreground">{profile.firstName} {profile.lastName}</h1>
              <p className="text-sm text-muted-foreground">{profile.title}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-foreground">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                  {profile.bio}
                </p>
                <div className="space-y-2.5 pt-3 border-t border-[var(--border)]">
                  {[
                    { icon: MapPin,     text: profile.location },
                    { icon: Briefcase,  text: profile.company },
                    { icon: Mail,       text: profile.email },
                    { icon: LinkIcon,   text: profile.website, accent: true },
                    { icon: Calendar,   text: 'Joined March 2026' },
                  ].map(({ icon: Icon, text, accent }) => (
                    <div
                      key={text}
                      className={`flex items-center gap-2.5 text-[13px] ${accent ? 'text-[var(--accent)] cursor-pointer hover:underline' : 'text-[var(--text-muted)]'}`}
                    >
                      <Icon className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your personal information and public profile.</CardDescription>
                  </div>
                  <AnimatePresence>
                    {savedFlash && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full"
                      >
                        <Check className="h-3.5 w-3.5" /> Saved
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSave}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">First Name</label>
                      <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Last Name</label>
                      <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Title / Headline</label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Email</label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Bio</label>
                    <textarea
                      className="flex min-h-[90px] w-full rounded-lg border border-[var(--border)] bg-[var(--bg-glass)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] focus:ring-1 focus:ring-[var(--accent)] focus:shadow-[0_0_10px_var(--accent-glow)] transition-all duration-200 custom-scrollbar resize-none"
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
                    <Button variant="outline" type="button" onClick={handleCancel}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
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