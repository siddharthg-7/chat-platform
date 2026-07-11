// frontend/src/components/chat/MessageBubble.jsx
import React from "react";
import { Check, CheckCheck } from "lucide-react";

const MessageBubble = ({ message }) => {
  const isIncoming = message.incoming;

  return (
    <div
      className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`
          max-w-[75%] lg:max-w-[60%]
          rounded-3xl
          px-4
          py-3
          shadow-sm
          transition-all
          duration-200
          hover:shadow-lg

          ${
            isIncoming
              ? "rounded-tl-lg bg-[var(--msg-in)] text-[var(--text)]"
              : "rounded-tr-lg bg-[var(--msg-out)] text-white"
          }
        `}
      >
        {/* Sender Name (Only for incoming group messages) */}
        {isIncoming && message.sender !== "You" && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            {message.sender}
          </p>
        )}

        {/* Message */}
        <p className="break-words whitespace-pre-wrap text-[15px] leading-7">
          {message.text}
        </p>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-end gap-1">
          <span
            className={`text-[11px] ${
              isIncoming
                ? "text-[var(--text-muted)]"
                : "text-white/80"
            }`}
          >
            {message.time}
          </span>

          {!isIncoming &&
            (message.read ? (
              <CheckCheck
                size={16}
                className="text-sky-300"
              />
            ) : (
              <Check
                size={16}
                className="text-white/70"
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;