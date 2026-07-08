import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { CheckCheck } from "lucide-react";

const ChatListItem = ({
  contact,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative
        mb-2
        flex
        w-full
        items-center
        gap-3
        rounded-2xl
        p-3
        text-left
        transition-all
        duration-200

        ${
          isActive
            ? "bg-slate-800 shadow-md"
            : "hover:bg-slate-800/60"
        }
      `}
    >

      {/* Active Indicator */}

      {isActive && (
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-emerald-400" />
      )}

      {/* Avatar */}

      <div className="relative shrink-0">

        <Avatar
          src={contact.avatar}
          fallback={contact.name.substring(0, 2)}
          className="h-12 w-12"
        />

        {contact.online && (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
        )}

      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">

        <div className="flex items-center justify-between">

          <h3 className="truncate font-semibold text-white">
            {contact.name}
          </h3>

          <span className="text-xs text-slate-400">
            {contact.time}
          </span>

        </div>

        <div className="mt-1 flex items-center justify-between">

          <div className="flex min-w-0 items-center gap-1">

            <CheckCheck
              size={15}
              className="shrink-0 text-sky-400"
            />

            <p className="truncate text-sm text-slate-400">
              {contact.lastMessage}
            </p>

          </div>

          {contact.unread > 0 && (
            <span
              className="
                ml-3
                flex
                h-5
                min-w-[20px]
                items-center
                justify-center
                rounded-full
                bg-emerald-500
                px-1.5
                text-[11px]
                font-semibold
                text-slate-900
              "
            >
              {contact.unread}
            </span>
          )}

        </div>

      </div>

    </button>
  );
};

export default ChatListItem;