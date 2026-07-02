import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Camera, MapPin, Link as LinkIcon, Mail, Briefcase, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Banner & Avatar Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <div className="h-64 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden shadow-md">
          <img src="https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2000&auto=format&fit=crop" alt="Banner" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
          <Button variant="secondary" size="sm" className="absolute top-4 right-4 glass text-white hover:text-black">
            <Camera className="h-4 w-4 mr-2" /> Change Cover
          </Button>
        </div>
        
        <div className="absolute -bottom-16 left-8 flex items-end">
          <div className="relative">
            <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" fallback="JD" className="h-32 w-32 border-4 border-background ring-4 ring-transparent shadow-xl" />
            <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md">
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div className="mb-4 ml-6">
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">John Doe</h1>
            <p className="text-white/90 font-medium drop-shadow-md">Senior Frontend Engineer</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
        
        {/* Left Column - Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Passionate software engineer focused on building scalable frontend architectures and beautiful user experiences.
              </p>
              <div className="space-y-3 pt-4 border-t border-border text-sm">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-3" /> San Francisco, CA
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Briefcase className="h-4 w-4 mr-3" /> ChatPlatform Inc.
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-3" /> john.doe@example.com
                </div>
                <div className="flex items-center text-primary cursor-pointer hover:underline">
                  <LinkIcon className="h-4 w-4 mr-3 text-muted-foreground" /> github.com/johndoe
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-3" /> Joined March 2026
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Edit Profile Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information and public profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input defaultValue="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title / Headline</label>
                  <Input defaultValue="Senior Frontend Engineer" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <textarea 
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 custom-scrollbar"
                    defaultValue="Passionate software engineer focused on building scalable frontend architectures and beautiful user experiences."
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
