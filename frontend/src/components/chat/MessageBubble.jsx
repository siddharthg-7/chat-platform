// frontend/src/components/chat/MessageBubble.jsx
import React, { useState } from "react";
import { Check, CheckCheck } from "lucide-react";
import wsService from '@/services/websocket';
import { useSelector } from 'react-redux';

const QUICK_REACTIONS = ['👍','❤️','😂','😮','😢','👏'];

const MessageBubble = ({ message }) => {
  const isIncoming = message.incoming;
  const [hover, setHover] = useState(false);
  const { user } = useSelector(state => state.auth);

  const userHasReacted = (emoji) => {
    return (message.reactions || []).some(r => String(r.user?.id) === String(user?.id) && r.emoji === emoji);
  };

  const handleReact = (emoji) => {
    const remove = userHasReacted(emoji);
    // Send via websocket for live updates
    try {
      wsService.send({ action: 'react', message_id: message.id, emoji, remove });
    } catch (err) {
      console.error('Failed to send reaction', err);
    }
  };

  // Aggregate reactions counts
  const reactionCounts = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
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

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {message.attachments.map(att => {
              const lower = att.file.toLowerCase();
              const isImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp') || lower.endsWith('.bmp');
              return isImage ? (
                <a key={att.id} href={att.file} target="_blank" rel="noreferrer" className="inline-block">
                  <img src={att.file} alt={att.file.split('/').pop()} className="max-h-40 rounded-md object-contain" />
                </a>
              ) : (
                <a key={att.id} href={att.file} target="_blank" rel="noreferrer" className="text-xs text-accent underline">
                  {att.file.split('/').pop()}
                </a>
              );
            })}
          </div>
        )}

        {/* Reactions summary */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <div key={emoji} className="rounded-full bg-glass px-2 py-0.5 text-sm">
                <span className="mr-1">{emoji}</span>
                <span className="text-xs">{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-end gap-1">
          <span
            className={`text-[11px] ${
              isIncoming
                ? "text-[var(--text-muted)]"
                : "text-white/80"
            }`}>
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

      {/* Reaction bar on hover */}
      {hover && (
        <div className="ml-2 flex items-center gap-1 self-end">
          {QUICK_REACTIONS.map(e => (
            <button key={e} onClick={() => handleReact(e)} className={`p-1 text-lg ${userHasReacted(e) ? 'opacity-80' : 'opacity-60'}`}>
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;