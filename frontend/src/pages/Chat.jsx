import React from 'react';
import { Search, MoreVertical, Paperclip, Send, Smile, Phone, Video, Users, CheckCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

const Chat = () => {
  const contacts = [
    { id: 1, name: "Engineering Team", lastMsg: "Deploy successful to production.", time: "10:42 AM", unread: 3 },
    { id: 2, name: "Sarah Connor", lastMsg: "Are we still on for the meeting?", time: "09:15 AM", unread: 0 },
    { id: 3, name: "Design Sync", lastMsg: "Figma files have been updated.", time: "Yesterday", unread: 1 },
    { id: 4, name: "John Doe", lastMsg: "Thanks for the help earlier!", time: "Yesterday", unread: 0 },
    { id: 5, name: "Product Managers", lastMsg: "Q3 roadmap is finalized.", time: "Monday", unread: 0 },
  ];

  return (
    <div className="flex h-screen w-screen bg-wa-bg text-wa-text overflow-hidden font-sans">
      
      {/* Left Pane: Contacts List (30%) */}
      <div className="w-[30%] min-w-[300px] max-w-[420px] flex-shrink-0 border-r border-wa-border flex flex-col bg-wa-bg">
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 bg-wa-panel text-wa-text-muted border-b border-wa-border">
          <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" className="h-10 w-10 cursor-pointer" />
          <div className="flex items-center gap-5">
            <Users className="h-5 w-5 cursor-pointer hover:text-white transition-colors" />
            <MoreVertical className="h-5 w-5 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-wa-border">
          <div className="flex items-center gap-4 bg-wa-panel rounded-lg px-4 py-1.5">
            <Search className="h-4 w-4 text-wa-text-muted" />
            <input 
              type="text" 
              placeholder="Search or start new chat" 
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-wa-text placeholder:text-wa-text-muted"
            />
          </div>
        </div>
        
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {contacts.map((contact, i) => (
            <div 
              key={contact.id}
              className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors ${i === 0 ? 'bg-wa-panel-hover' : 'hover:bg-wa-panel'}`}
            >
              <Avatar fallback={contact.name.substring(0,2).toUpperCase()} className="h-12 w-12" />
              <div className="flex-1 overflow-hidden border-b border-wa-border pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-normal text-[17px] text-wa-text truncate">{contact.name}</span>
                  <span className={`text-xs ${contact.unread > 0 ? 'text-wa-teal font-medium' : 'text-wa-text-muted'}`}>
                    {contact.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-wa-text-muted truncate">{contact.lastMsg}</span>
                  {contact.unread > 0 && (
                    <div className="ml-2 h-5 min-w-[20px] rounded-full bg-wa-teal text-wa-bg text-xs font-bold flex items-center justify-center px-1">
                      {contact.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Active Chat (70%) */}
      <div className="flex-1 flex flex-col min-w-0 bg-wa-bg relative">
        
        {/* Chat Header */}
        <div className="h-16 flex items-center justify-between px-4 bg-wa-panel border-b border-wa-border z-10 shadow-sm">
          <div className="flex items-center gap-4 cursor-pointer">
            <Avatar fallback="ET" className="h-10 w-10" />
            <div>
              <h3 className="font-normal text-[16px] text-wa-text">Engineering Team</h3>
              <p className="text-[13px] text-wa-text-muted">John, Sarah, Design Sync, You</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-wa-text-muted">
            <Video className="h-5 w-5 cursor-pointer hover:text-white transition-colors" />
            <Phone className="h-5 w-5 cursor-pointer hover:text-white transition-colors" />
            <Search className="h-5 w-5 cursor-pointer hover:text-white transition-colors" />
            <MoreVertical className="h-5 w-5 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {/* Chat Background & Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2 wa-bg-pattern relative">
          
          <div className="flex justify-center mb-6">
            <span className="text-xs font-medium text-wa-text-muted bg-wa-panel px-3 py-1 rounded-lg uppercase tracking-wide">
              Today
            </span>
          </div>

          {/* Received Message */}
          <div className="flex gap-2">
            <div className="bg-wa-msg-in rounded-lg rounded-tl-none px-3 py-2 text-[14.2px] max-w-[65%] text-wa-text shadow-sm relative">
              <span className="font-bold text-[13px] text-blue-400 block mb-0.5">John Doe</span>
              Hey team! The new authentication microservice is deployed and stable. 🚀
              <span className="text-[11px] text-wa-text-muted float-right mt-2 ml-4">10:42 AM</span>
            </div>
          </div>

          {/* Sent Message */}
          <div className="flex gap-2 flex-row-reverse">
            <div className="bg-wa-msg-out rounded-lg rounded-tr-none px-3 py-2 text-[14.2px] max-w-[65%] text-wa-text shadow-sm relative">
              Awesome work! I'll start integrating the frontend JWT logic today.
              <div className="float-right mt-1 ml-4 flex items-center gap-1">
                <span className="text-[11px] text-wa-text-muted">10:45 AM</span>
                <CheckCheck className="h-4 w-4 text-[#53bdeb]" />
              </div>
            </div>
          </div>

          {/* Received Message */}
          <div className="flex gap-2">
            <div className="bg-wa-msg-in rounded-lg rounded-tl-none px-3 py-2 text-[14.2px] max-w-[65%] text-wa-text shadow-sm relative mt-2">
              <span className="font-bold text-[13px] text-pink-400 block mb-0.5">Sarah Connor</span>
              Don't forget to update the Swagger docs.
              <span className="text-[11px] text-wa-text-muted float-right mt-2 ml-4">10:50 AM</span>
            </div>
          </div>
        </div>

        {/* Chat Input Footer */}
        <div className="min-h-[62px] px-4 py-2 bg-wa-panel flex items-center gap-4 text-wa-text-muted z-10">
          <Smile className="h-6 w-6 cursor-pointer hover:text-white transition-colors shrink-0" />
          <Paperclip className="h-6 w-6 cursor-pointer hover:text-white transition-colors shrink-0" />
          
          <div className="flex-1 bg-wa-bg rounded-lg px-4 py-2">
            <input 
              type="text" 
              placeholder="Type a message" 
              className="w-full bg-transparent border-none focus:outline-none text-[15px] text-wa-text placeholder:text-wa-text-muted"
            />
          </div>
          
          <Send className="h-6 w-6 cursor-pointer hover:text-white transition-colors shrink-0" />
        </div>

      </div>
    </div>
  );
};

export default Chat;
