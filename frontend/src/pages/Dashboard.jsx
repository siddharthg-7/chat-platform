import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, Users, Activity, ArrowUpRight, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const stats = [
    { title: "Total Messages", value: "24,593", icon: MessageSquare, change: "+12.5%" },
    { title: "Active Users", value: "1,205", icon: Users, change: "+4.1%" },
    { title: "Uptime", value: "99.99%", icon: Activity, change: "0.0%" },
  ];

  const recentChats = [
    { id: 1, name: "Engineering Team", message: "Deploy successful to production.", time: "2m ago", unread: 3, group: true },
    { id: 2, name: "Sarah Connor", message: "Are we still on for the meeting?", time: "15m ago", unread: 0, group: false },
    { id: 3, name: "Design Sync", message: "Figma files have been updated.", time: "1h ago", unread: 1, group: true },
    { id: 4, name: "John Doe", message: "Thanks for the help earlier!", time: "2h ago", unread: 0, group: false },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-9 bg-card" />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                  <span className="text-emerald-500 font-medium">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Chats */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>You have 4 unread messages in 2 conversations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentChats.map((chat) => (
                <div key={chat.id} className="flex items-center group cursor-pointer">
                  <Avatar 
                    fallback={chat.name.substring(0, 2).toUpperCase()} 
                    className="h-10 w-10 border-2 border-transparent group-hover:border-primary transition-all" 
                  />
                  <div className="ml-4 space-y-1 flex-1 overflow-hidden">
                    <p className="text-sm font-medium leading-none flex justify-between">
                      {chat.name}
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{chat.message}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="ml-4 flex-shrink-0">
                      <Badge variant="default" className="rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                        {chat.unread}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Real-time platform metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">WebSocket Connection</span>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Database Sync</span>
                <Badge variant="success">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Redis Cache</span>
                <Badge variant="success">Optimal</Badge>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full text-xs h-9">Invite Team</Button>
                <Button variant="outline" className="w-full text-xs h-9">Create Channel</Button>
                <Button variant="outline" className="w-full text-xs h-9">Settings</Button>
                <Button variant="outline" className="w-full text-xs h-9">Support</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
