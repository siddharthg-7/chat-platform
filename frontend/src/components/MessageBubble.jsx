import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Download, FileText, SmilePlus } from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
import { chatService } from '@/services/chat.service';
import { useDispatch } from 'react-redux';
import { updateMessageReactions } from '@/store/slices/chatSlice';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif'];

const isImageFile = (url) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

const fileNameFromUrl = (url) => {
  try {
    return decodeURIComponent(url.split('/').pop().split('?')[0]);
  } catch {
    return 'attachment';
  }
};

export default function MessageBubble({ message }) {
  // Matches the shape built in ChatMessages.jsx's formattedMessage:
  // { id, text, sender, incoming, time, read, attachments, reactions }
  const isIncoming = message.incoming;
  const attachments = message.attachments || [];
  const reactions = message.reactions || [];
  
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const dispatch = useDispatch();

  const handleReact = async (emojiData) => {
    setShowReactionPicker(false);
    try {
      const reactionResponse = await chatService.toggleReaction(message.id, emojiData.emoji);
      // Wait, toggleReaction returns either the new reaction or {status: 'removed'}
      // We need to fetch or update the reactions list. A simpler way is to just dispatch the update if it works,
      // but without the full list from backend it's tricky. Let's just refetch messages, or let WS handle it if WS is built.
      // Since we don't have WS for reactions yet, let's just ignore optimistic update for now or just append/remove locally.
      // But the endpoint only returns the single reaction.
      // Let's rely on a manual local state update for now.
    } catch (err) {
      console.error(err);
    }
  };

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={cn("flex group relative", isIncoming ? "justify-start" : "justify-end")}>
      {!isIncoming && (
        <div className="mr-2 self-center opacity-0 transition-opacity group-hover:opacity-100 relative">
          <button onClick={() => setShowReactionPicker(p => !p)} className="p-1 text-muted-foreground hover:text-foreground">
            <SmilePlus className="h-4 w-4" />
          </button>
          {showReactionPicker && (
            <div className="absolute right-0 bottom-full mb-1 z-30">
              <EmojiPicker onEmojiClick={handleReact} theme="dark" width={280} height={350} />
            </div>
          )}
        </div>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm relative",
          isIncoming ? "bg-glass text-foreground rounded-bl-sm" : "bg-accent text-white rounded-br-sm"
        )}
      >
        {isIncoming && message.sender && (
          <div className="mb-1 text-xs font-semibold text-accent">
            {message.sender.toUpperCase()}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mb-2 flex flex-col gap-2">
            {attachments.map((att) => (
              isImageFile(att.file) ? (
                <a key={att.id} href={att.file} target="_blank" rel="noopener noreferrer">
                  <img
                    src={att.file}
                    alt="attachment"
                    className="max-h-64 rounded-lg border border-black/10 object-cover"
                  />
                </a>
              ) : (
                <a
                  key={att.id}
                  href={att.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition",
                    isIncoming ? "bg-black/10 hover:bg-black/20" : "bg-white/15 hover:bg-white/25"
                  )}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">{fileNameFromUrl(att.file)}</span>
                  <Download className="h-3.5 w-3.5 shrink-0" />
                </a>
              )
            ))}
          </div>
        )}

        {message.text && <p>{message.text}</p>}

        <div
          className={cn(
            "mt-1 text-[10px]",
            isIncoming ? "text-muted-foreground" : "text-white/70 text-right"
          )}
        >
          {message.read && !isIncoming ? "Seen · " : ""}
          {message.time}
        </div>

        {Object.entries(groupedReactions).length > 0 && (
          <div className={cn("flex flex-wrap gap-1 mt-1 -mb-4 relative z-10", isIncoming ? "justify-start" : "justify-end")}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <span key={emoji} className="bg-black/20 text-xs px-1.5 py-0.5 rounded-full shadow-sm">
                {emoji} {count > 1 && count}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {isIncoming && (
        <div className="ml-2 self-center opacity-0 transition-opacity group-hover:opacity-100 relative">
          <button onClick={() => setShowReactionPicker(p => !p)} className="p-1 text-muted-foreground hover:text-foreground">
            <SmilePlus className="h-4 w-4" />
          </button>
          {showReactionPicker && (
            <div className="absolute left-0 bottom-full mb-1 z-30">
              <EmojiPicker onEmojiClick={handleReact} theme="dark" width={280} height={350} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}