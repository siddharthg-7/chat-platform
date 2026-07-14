import { cn } from "@/lib/utils";
import { Download, FileText } from "lucide-react";

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
  // { id, text, sender, incoming, time, read, attachments }
  const isIncoming = message.incoming;
  const attachments = message.attachments || [];

  return (
    <div className={cn("flex", isIncoming ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
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
      </div>
    </div>
  );
}