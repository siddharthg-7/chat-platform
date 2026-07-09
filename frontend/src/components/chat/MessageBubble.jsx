import React from "react";
import { Check, CheckCheck } from "lucide-react";

const MessageBubble = ({ message }) => {
  const isIncoming = message.incoming;

  return (
    <div
      className={`flex ${
        isIncoming ? "justify-start" : "justify-end"
      }`}
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
              ? "rounded-tl-lg bg-slate-800 text-white"
              : "rounded-tr-lg bg-emerald-600 text-white"
          }
        `}
      >
        {/* Sender Name (Only for incoming group messages) */}
        {isIncoming && message.sender !== "You" && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
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
                ? "text-slate-400"
                : "text-emerald-100"
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
                className="text-emerald-100"
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;