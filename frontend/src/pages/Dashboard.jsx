import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, Users, Activity, ArrowUpRight, Plus, Search, TrendingUp, Wifi, Database, Server, UserCircle, X, Mail, Clock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const STATS = [
  { title: 'Total Messages', value: '24,593', change: '+12.5%', icon: MessageSquare },
  { title: 'Total Contacts', value: '1,205', change: '+4.1%', icon: Users },
  { title: 'Platform Uptime', value: '99.99%', change: '+0.0%', icon: Activity },
];

const RECENT_CHATS = [
  { id: 1, name: 'Sarah Connor', message: 'Are we still on for the meeting?', time: '15m ago', unread: 2 },
  { id: 2, name: 'John Doe', message: 'Thanks for the help earlier!', time: '2h ago', unread: 0 },
  { id: 3, name: 'Emily Carter', message: 'Sent over the files you asked for.', time: '3h ago', unread: 1 },
  { id: 4, name: 'Michael Lee', message: 'Sounds good, talk soon!', time: '5h ago', unread: 0 },
];

const ALL_CONTACTS = [
  { id: 1, name: 'Sarah Connor', status: 'online' },
  { id: 2, name: 'John Doe', status: 'offline' },
  { id: 3, name: 'Emily Carter', status: 'online' },
  { id: 4, name: 'Michael Lee', status: 'away' },
  { id: 5, name: 'Priya Nair', status: 'online' },
  { id: 6, name: 'Daniel Kim', status: 'offline' },
];

const STATUS_ITEMS = [
  { label: 'WebSocket', status: 'Connected', icon: Wifi, variant: 'success' },
  { label: 'Database Sync', status: 'Healthy', icon: Database, variant: 'success' },
  { label: 'Redis Cache', status: 'Optimal', icon: Server, variant: 'success' },
];

const statusColor = {
  online: 'bg-emerald-400',
  away: 'bg-amber-400',
  offline: 'bg-[var(--text-muted)]',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleQuickAction = (action) => {
    switch (action) {
      case 'Add Contact':
        {
          const username = window.prompt('Enter username to add as contact:');
          if (username && username.trim()) {
            // Hook this up to your real "add contact" API when ready
            navigate('/chat');
          }
        }
        break;
      case 'New Chat':
        navigate('/chat');
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

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-surface)]">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-7">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Dashboard</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Welcome back — here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input type="search" placeholder="Search…" className="pl-9 h-9" />
            </div>
            <Button className="gap-2 h-9" onClick={() => navigate('/chat')}>
              <Plus className="h-4 w-4" /> New Chat
            </Button>
          </div>
        </motion.div>

        {/* Upper Grid */}
        <div className="grid gap-4 lg:grid-cols-3">

          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Chats</CardTitle>
                    <CardDescription className="mt-0.5">You have 3 unread messages.</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate('/chat')}>
                    View all <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                {RECENT_CHATS.map((chat, i) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    onClick={() => navigate('/chat')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-all duration-150 group"
                  >
                    <Avatar fallback={chat.name.substring(0, 2).toUpperCase()} className="h-10 w-10 text-sm shrink-0 group-hover:ring-2 group-hover:ring-[var(--accent)] transition-all duration-200" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-[var(--text)] truncate">{chat.name}</span>
                        <span className="text-[11px] text-[var(--text-muted)] shrink-0">{chat.time}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{chat.message}</p>
                    </div>
                    {chat.unread > 0 && (
                      <div className="shrink-0 h-5 min-w-[20px] rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center px-1.5 shadow-[0_0_10px_var(--accent-glow)]">
                        {chat.unread}
                      </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-0">
                <div className="flex items-center gap-3">
                  <Avatar fallback="YO" className="h-14 w-14 text-lg" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">You</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">you@example.com</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Status</span>
                    <Badge variant="success">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Contacts</span>
                    <span className="text-[var(--text)] font-medium">1,205</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs gap-2" onClick={() => navigate('/profile')}>
                  <UserCircle className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Lower Grid */}
        <div className="grid gap-4 lg:grid-cols-3">

          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>All Contacts</CardTitle>
                    <CardDescription className="mt-0.5">Everyone you can chat with.</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate('/chat')}>
                    View all <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-0">
                {ALL_CONTACTS.map((contact, i) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    onClick={() => navigate('/chat')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-all duration-150 group"
                  >
                    <div className="relative shrink-0">
                      <Avatar fallback={contact.name.substring(0, 2).toUpperCase()} className="h-9 w-9 text-xs group-hover:ring-2 group-hover:ring-[var(--accent)] transition-all duration-200" />
                      <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--bg-surface)] ${statusColor[contact.status]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[var(--text)] truncate block">{contact.name}</span>
                      <span className="text-[11px] text-[var(--text-muted)] capitalize">{contact.status}</span>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Real-time platform metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-0">
                <div className="space-y-2.5">
                  {STATUS_ITEMS.map(({ label, status, icon: Icon, variant }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </div>
                      <Badge variant={variant}>{status}</Badge>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Add Contact', 'New Chat', 'Settings', 'Support'].map((action) => (
                      <Button key={action} variant="outline" size="sm" className="w-full text-xs" onClick={() => handleQuickAction(action)}>
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 pb-8">
          {STATS.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <Card className="hover:border-[var(--border-active)] transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-[var(--text)] tracking-tight">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-500">{stat.change}</span>
                        <span className="text-xs text-[var(--text-muted)]">from last month</span>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] shrink-0">
                      <stat.icon className="h-5 w-5 text-white" />
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
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <button
                onClick={() => setShowSupportModal(false)}
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-lg font-semibold text-[var(--text)] mb-1">Need Help?</h3>
              <p className="text-sm text-[var(--text-muted)] mb-5">
                Our support team is here for you 24/7. Reach out anytime.
              </p>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[var(--bg-glass-hover)]">
                  <Mail className="h-4 w-4 text-[var(--accent)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[var(--text-muted)]">Email</p>
                    <p className="text-[var(--text)] font-medium truncate">support@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[var(--bg-glass-hover)]">
                  <Clock className="h-4 w-4 text-[var(--accent)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[var(--text-muted)]">Avg. Response Time</p>
                    <p className="text-[var(--text)] font-medium">~2 hours</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
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
    </div>
  );
};

export default Dashboard;