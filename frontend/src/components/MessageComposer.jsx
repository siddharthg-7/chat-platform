import { useState } from "react";
import { Send, Zap, MoreHorizontal } from "lucide-react";

export default function MessageComposer({ onSend, recipientLabel, disabled }) {
  const [value, setValue] = useState("");

  function handleSend() {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-border bg-panel px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-muted mb-2">
        <span className="font-medium text-white/80">Reply</span>
        <span className="px-2 py-0.5 rounded bg-panel2 border border-border">{recipientLabel}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        placeholder="Type your message..."
        className="w-full resize-none bg-transparent text-sm text-white placeholder:text-muted focus:outline-none"
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3 text-muted">
          <button className="hover:text-white" title="Macros">
            <Zap size={16} />
          </button>
          <button className="hover:text-white" title="More">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="flex items-center gap-1.5 bg-accent hover:bg-accent2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white text-sm font-semibold px-4 py-1.5 rounded-lg"
        >
          Send
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
