import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, Lock, Eye, MonitorSmartphone, Volume2, Shield } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        
        {/* Settings Navigation */}
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 custom-scrollbar">
          <Button variant="secondary" className="justify-start gap-3 w-full shrink-0">
            <MonitorSmartphone className="h-4 w-4" /> Appearance
          </Button>
          <Button variant="ghost" className="justify-start gap-3 w-full shrink-0 text-muted-foreground">
            <Bell className="h-4 w-4" /> Notifications
          </Button>
          <Button variant="ghost" className="justify-start gap-3 w-full shrink-0 text-muted-foreground">
            <Lock className="h-4 w-4" /> Privacy & Security
          </Button>
          <Button variant="ghost" className="justify-start gap-3 w-full shrink-0 text-muted-foreground">
            <Volume2 className="h-4 w-4" /> Audio & Video
          </Button>
          <Button variant="ghost" className="justify-start gap-3 w-full shrink-0 text-muted-foreground">
            <Shield className="h-4 w-4" /> Advanced
          </Button>
        </nav>

        {/* Settings Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
              <CardDescription>Customize the look and feel of your application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Dark Mode First</h4>
                  <p className="text-sm text-muted-foreground">The platform is optimized for dark mode.</p>
                </div>
                <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg border border-border">
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-muted-foreground">Light</Button>
                  <Button variant="default" size="sm" className="h-7 text-xs px-2 shadow-sm">Dark</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-muted-foreground">System</Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Accent Color</h4>
                  <p className="text-sm text-muted-foreground">Choose your primary color.</p>
                </div>
                <div className="flex gap-2">
                  <button className="h-6 w-6 rounded-full bg-blue-600 ring-2 ring-blue-600 ring-offset-2 ring-offset-background"></button>
                  <button className="h-6 w-6 rounded-full bg-purple-600"></button>
                  <button className="h-6 w-6 rounded-full bg-emerald-500"></button>
                  <button className="h-6 w-6 rounded-full bg-rose-500"></button>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Display</CardTitle>
              <CardDescription>How messages are rendered in your chat window.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Compact Mode</h4>
                  <p className="text-sm text-muted-foreground">Fit more messages on the screen.</p>
                </div>
                {/* Mock Toggle Switch */}
                <div className="h-6 w-11 rounded-full bg-secondary border border-border relative cursor-pointer">
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-muted-foreground transition-all"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Show Link Previews</h4>
                  <p className="text-sm text-muted-foreground">Automatically fetch and display embedded URLs.</p>
                </div>
                {/* Mock Toggle Switch On */}
                <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                  <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-primary-foreground transition-all"></div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
