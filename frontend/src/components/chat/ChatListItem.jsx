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
            ? "bg-glass-active shadow-md"
            : "hover:bg-glass-hover"
        }
      `}
    >
      {isActive && (
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-accent" />
      )}

      <div className="relative shrink-0">
        <Avatar
          src={contact.avatar}
          fallback={contact.name.substring(0, 2)}
          className="h-12 w-12"
        />
        {contact.online && (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-panel bg-accent" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="truncate font-semibold text-foreground">
            {contact.name}
          </h3>
          <span className="text-xs text-muted-foreground">
            {contact.time}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-1">
            <CheckCheck
              size={15}
              className="shrink-0 text-accent"
            />
            <p className="truncate text-sm text-muted-foreground">
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
                bg-accent
                px-1.5
                text-[11px]
                font-semibold
                text-white
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