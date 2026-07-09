import { cn } from "../lib/utils";

export default function MessageBubble({ message }) {
  const isAgent = message.from === "agent";

  if (message.kind === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[11px] text-muted bg-panel2 border border-border px-2.5 py-1 rounded-full">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex", isAgent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-xl2 px-4 py-2.5 text-sm leading-relaxed shadow-soft",
          isAgent ? "bg-accent text-white rounded-br-sm" : "bg-panel2 text-white/90 rounded-bl-sm"
        )}
      >
        {message.tag && (
          <div className="mb-1.5 inline-flex items-center gap-1 text-[11px] bg-black/20 rounded-md px-2 py-1">
            {message.tag}
          </div>
        )}
        <p>{message.text}</p>
        <div
          className={cn(
            "mt-1 text-[10px]",
            isAgent ? "text-white/70 text-right" : "text-muted"
          )}
        >
          {message.seen ? "Seen · " : ""}
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
