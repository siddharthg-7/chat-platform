import React from "react";
import { MoreVertical } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

const ChatHeader = ({ chat }) => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">

      <div className="flex items-center gap-4">

        <div className="relative">

          <Avatar
            src={chat.avatar}
            fallback={chat.name.substring(0, 2)}
            className="h-11 w-11"
          />

          {chat.online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
          )}

        </div>

        <div>

          <h2 className="font-semibold text-white">
            {chat.name}
          </h2>

          <p className="text-xs text-slate-400">
            {chat.isGroup
              ? "12 members • 5 online"
              : chat.online
              ? "Online"
              : "Offline"}
          </p>

        </div>

      </div>

      <button
        className="
          rounded-xl
          p-2
          text-slate-400
          transition
          hover:bg-slate-800
          hover:text-white
        "
      >
        <MoreVertical size={20} />
      </button>

    </header>
  );
};

export default ChatHeader;