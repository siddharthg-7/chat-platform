import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, Users, Activity, ArrowUpRight, Plus, Search, TrendingUp, Wifi, Database, Server } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';

const STATS = [
  {
    title: 'Total Messages',
    value: '24,593',
    change: '+12.5%',
    icon: MessageSquare,
    gradient: 'from-indigo-500 to-purple-600',
    glow: 'rgba(99,102,241,0.3)',
  },
  {
    title: 'Active Users',
    value: '1,205',
    change: '+4.1%',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    title: 'Platform Uptime',
    value: '99.99%',
    change: '+0.0%',
    icon: Activity,
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.3)',
  },
];

const RECENT_CHATS = [
  { id: 1, name: 'Engineering Team', message: 'Deploy successful to production. 🚀', time: '2m ago', unread: 3, group: true },
  { id: 2, name: 'Sarah Connor', message: 'Are we still on for the meeting?', time: '15m ago', unread: 0, group: false },
  { id: 3, name: 'Design Sync', message: 'Figma files have been updated.', time: '1h ago', unread: 1, group: true },
  { id: 4, name: 'John Doe', message: 'Thanks for the help earlier!', time: '2h ago', unread: 0, group: false },
];

const STATUS_ITEMS = [
  { label: 'WebSocket', status: 'Connected', icon: Wifi, variant: 'success' },
  { label: 'Database Sync', status: 'Healthy', icon: Database, variant: 'success' },
  { label: 'Redis Cache', status: 'Optimal', icon: Server, variant: 'success' },
];

const Dashboard = () => {
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
            <Button className="gap-2 h-9">
              <Plus className="h-4 w-4" /> New Chat
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="hover:border-[var(--border-active)] group transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-[var(--text)] tracking-tight">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">{stat.change}</span>
                        <span className="text-xs text-[var(--text-muted)]">from last month</span>
                      </div>
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shrink-0`}
                      style={{ boxShadow: `0 0 16px ${stat.glow}` }}
                    >
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Lower Grid */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Recent Chats — spans 2 cols */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription className="mt-0.5">You have 4 unread messages in 2 conversations.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                {RECENT_CHATS.map((chat, i) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-all duration-150 group"
                  >
                    <Avatar
                      fallback={chat.name.substring(0, 2).toUpperCase()}
                      className="h-10 w-10 text-sm shrink-0 group-hover:ring-2 group-hover:ring-[var(--accent)] transition-all duration-200"
                    />
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

          {/* System Status + Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
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
                    {['Invite Team', 'New Channel', 'Settings', 'Support'].map((action) => (
                      <Button key={action} variant="outline" size="sm" className="w-full text-xs">
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
