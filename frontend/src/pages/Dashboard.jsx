import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { MessageSquare, Users, Activity, ArrowUpRight, Plus, Search, TrendingUp, UserCircle, X, Mail, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '@/services/chat.service';
import { setConversations, setActiveConversation } from '@/store/slices/chatSlice';
import NewChatModal from '@/components/chat/NewChatModal';

const statusColor = {
  online: 'bg-accent',
  away: 'bg-amber-400',
  offline: 'bg-muted-foreground',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useSelector((state) => state.auth);
  const { conversations, onlineUsers } = useSelector((state) => state.chat);

  useEffect(() => {
    chatService
      .getConversations()
      .then((data) => {
        dispatch(setConversations(data));
      })
      .catch((err) => {
        console.error('[Dashboard] Failed to fetch conversations:', err);
        toast.error('Could not load your conversations. Pull to refresh or try again shortly.');
      });
  }, [dispatch]);

  if (!user) return null;

  const recentChats = conversations
    .filter((c) => {
      const other = c.participants?.find((p) => p.username !== user.username) || c.participants?.[0];
      const name = c.is_group ? c.name : (other?.username || 'Unknown');
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .slice(0, 4)
    .map((chat) => {
      const otherParticipant = chat.participants?.find((p) => p.username !== user.username) || chat.participants?.[0];
      const contactName = chat.is_group ? chat.name : (otherParticipant?.username || 'Unknown');
      let timeStr = '';
      if (chat.last_message) {
        timeStr = new Date(chat.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return {
        id: chat.id,
        name: contactName,
        message: chat.last_message?.text || 'No messages yet',
        time: timeStr,
        unread: chat.unread_count || 0,
      };
    });

  const uniqueContactsMap = {};
  conversations.forEach((chat) => {
    chat.participants?.forEach((p) => {
      if (p.username !== user.username && !uniqueContactsMap[p.id]) {
        uniqueContactsMap[p.id] = {
          id: p.id,
          name: p.username,
          status: onlineUsers.includes(p.id) ? 'online' : 'offline',
        };
      }
    });
  });

  const allContacts = Object.values(uniqueContactsMap).filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  const handleSelectRecentChat = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
    navigate('/chat');
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'Add Contact':
      case 'New Chat':
        setShowNewChatModal(true);
        break;
      case 'Settings':
        navigate('/settings');
        break;
      case 'Support':
        setShowSupportModal(true);
        break;
      default:
        break;
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
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-7">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome back — here's what's happening today.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search chats & contacts…"
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="gap-2 h-9 w-full sm:w-auto" onClick={() => setShowNewChatModal(true)}>
              <Plus className="h-4 w-4" /> New Chat
            </Button>
          </div>
        </motion.div>

        {/* Upper Grid */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Recent Chats Card */}
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Chats</CardTitle>
                    {totalUnreadMessages > 0 ? (
                      <CardDescription className="mt-0.5 text-accent">
                        You have {totalUnreadMessages} unread message{totalUnreadMessages === 1 ? '' : 's'}.
                      </CardDescription>
                    ) : (
                      <CardDescription className="mt-0.5">All caught up!</CardDescription>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate('/chat')}>
                    View all <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                {recentChats.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-10">No recent conversations.</p>
                ) : (
                  recentChats.map((chat, i) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      onClick={() => handleSelectRecentChat(chat.id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-glass-hover transition-all duration-150 group"
                    >
                      <Avatar
                        fallback={chat.name.substring(0, 2).toUpperCase()}
                        className="h-10 w-10 text-sm shrink-0 group-hover:ring-2 group-hover:ring-accent transition-all duration-200 bg-accent font-semibold text-white"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground truncate">{chat.name}</span>
                          <span className="text-[11px] text-muted-foreground shrink-0">{chat.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.message}</p>
                      </div>
                      {chat.unread > 0 && (
                        <div className="shrink-0 h-5 min-w-[20px] rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center px-1.5 shadow-glow-sm">
                          {chat.unread}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Your account credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-0">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={getAvatarUrl()}
                    fallback={user.username.substring(0, 2).toUpperCase()}
                    className="h-14 w-14 text-lg bg-accent font-bold text-white border-2 border-accent"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Presence</span>
                    <Badge variant="success">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Contacts</span>
                    <span className="text-foreground font-medium">{allContacts.length}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs gap-2" onClick={() => navigate('/profile')}>
                  <UserCircle className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Lower Grid: Contacts + Quick Actions */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Contacts Card */}
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Your Contacts</CardTitle>
                    <CardDescription className="mt-0.5">Active messaging connections</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate('/chat')}>
                    View all <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-0">
                {allContacts.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-10 sm:col-span-2">No contacts found.</p>
                ) : (
                  allContacts.map((contact, i) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      onClick={() => {
                        const chat = conversations.find((c) =>
                          !c.is_group && c.participants?.some((p) => p.id === contact.id)
                        );
                        if (chat) handleSelectRecentChat(chat.id);
                        else navigate('/chat');
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-glass-hover transition-all duration-150 group"
                    >
                      <div className="relative shrink-0">
                        <Avatar
                          fallback={contact.name.substring(0, 2).toUpperCase()}
                          className="h-9 w-9 text-xs group-hover:ring-2 group-hover:ring-accent transition-all duration-200 bg-accent font-semibold text-white"
                        />
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface ${statusColor[contact.status]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate block">{contact.name}</span>
                        <span className="text-[11px] text-muted-foreground capitalize">{contact.status}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions Card — buttons only, no system health metrics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump to what you need</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  {['Add Contact', 'New Chat', 'Settings', 'Support'].map((action) => (
                    <Button key={action} variant="outline" size="sm" className="w-full text-xs" onClick={() => handleQuickAction(action)}>
                      {action}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Stats Section */}
        <div className="grid gap-4 sm:grid-cols-3 pb-8">
          {[
            { title: 'Total Conversations', value: conversations.length, icon: MessageSquare, label: 'chats' },
            { title: 'Total Contacts', value: allContacts.length, icon: Users, label: 'connections' },
            { title: 'Online Presence', value: onlineUsers.length, icon: Activity, label: 'active now' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <Card className="hover:border-border transition-all duration-200 bg-panel">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="h-3 w-3 text-accent" />
                        <span className="text-xs font-semibold text-accent">Live</span>
                        <span className="text-xs text-muted-foreground">{stat.label} on platform</span>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setShowSupportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-panel border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <button
                onClick={() => setShowSupportModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-lg font-semibold text-foreground mb-1">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Our support team is here for you 24/7. Reach out anytime.
              </p>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-glass">
                  <Mail className="h-4 w-4 text-accent shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Email</p>
                    <p className="text-foreground font-medium truncate">support@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-glass">
                  <Clock className="h-4 w-4 text-accent shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Avg. Response Time</p>
                    <p className="text-foreground font-medium">~2 hours</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-accent hover:bg-accent-hover text-white border-none"
                  onClick={() => (window.location.href = 'mailto:support@example.com')}
                >
                  Email Us
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowSupportModal(false)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal onClose={() => setShowNewChatModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
