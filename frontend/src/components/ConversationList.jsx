import { ChevronDown, PanelLeft, Search } from "lucide-react";
import { cn, formatRelativeTime } from "../lib/utils";
import Avatar from "./ui/Avatar";

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  filterLabel = "Open",
}) {
  const openCount = conversations.filter((c) => c.status === "open").length;

  return (
    <section className="w-full max-w-[19rem] shrink-0 border-r border-border bg-ink flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2 font-semibold text-white">
          <PanelLeft size={16} className="text-muted" />
          Your inbox
        </div>
        <button className="text-muted hover:text-white">
          <Search size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-3 text-sm text-muted">
        <button className="flex items-center gap-1 font-medium text-white">
          {openCount} {filterLabel}
          <ChevronDown size={14} />
        </button>
        <button className="flex items-center gap-1">
          Newest
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const active = conv.id === activeId;
          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "w-full text-left px-4 py-3 border-b border-border/60 flex gap-3 transition-colors",
                active ? "bg-panel2" : "hover:bg-panel/60"
              )}
            >
              <Avatar name={conv.contactName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-sm",
                      conv.unread ? "font-semibold text-white" : "font-medium text-white/90"
                    )}
                  >
                    {conv.contactName}
                  </span>
                  <span className="text-xs text-muted shrink-0">
                    {formatRelativeTime(conv.lastMessageAt)}
                  </span>
                </div>
                <p className="text-xs text-muted truncate mt-0.5">{conv.lastMessage}</p>
              </div>
              {conv.unread && <span className="w-2 h-2 rounded-full bg-accent2 mt-1.5 shrink-0" />}
            </button>
          );
        })}

        {conversations.length === 0 && (
          <div className="p-6 text-sm text-muted text-center">No conversations yet.</div>
        )}
      </div>
    </section>
  );
}
