import { useEffect, useRef } from "react";
import { MoreHorizontal, Clock, X } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import ConnectionStatus from "./ConnectionStatus";

export default function ChatWindow({ conversation, messages, socketStatus, onSend }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-sm">
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <section className="flex-1 flex flex-col min-w-0 bg-ink">
      <header className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <p className="text-sm font-semibold text-white truncate">{conversation.contactEmail}</p>
          </div>
          <ConnectionStatus status={socketStatus} />
        </div>
        <div className="flex items-center gap-2 text-muted">
          <button className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg hover:bg-panel2 hover:text-white">
            <Clock size={14} />
            Snooze
          </button>
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/90 text-ink font-semibold hover:bg-white">
            <X size={14} />
            Close
          </button>
          <button className="hover:text-white">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {messages.length === 0 && (
          <div className="text-center text-muted text-sm mt-10">
            No messages yet — say hello to get the conversation started.
          </div>
        )}
      </div>

      <MessageComposer
        recipientLabel={conversation.contactEmail}
        onSend={onSend}
        disabled={socketStatus === "disconnected" || socketStatus === "error"}
      />
    </section>
  );
}
