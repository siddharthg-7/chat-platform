import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { 
  Check, 
  CheckCheck, 
  MoreVertical, 
  CornerUpLeft, 
  Smile, 
  Pin, 
  Copy, 
  Trash, 
  Edit3, 
  Play, 
  Pause, 
  FileText,
  Download,
  Star
} from "lucide-react";
import wsService from "@/services/websocket";
import { setReplyingTo, setEditingMessage, toggleMessageStarStatus } from "@/store/slices/chatSlice";
import { toast } from 'sonner';
import { chatService } from "@/services/chat.service";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const MessageBubble = ({ message }) => {
  const dispatch = useDispatch();
  const { activeConversation } = useSelector((state) => state.chat);
  
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Custom Voice Note Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const onLoadedMetadata = () => setDuration(audio.duration || 0);
      const onTimeUpdate = () => setCurrentTime(audio.currentTime);
      const onEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('ended', onEnded);
      };
    }
  }, [message.voice_note]);

  const togglePlayVoiceNote = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.warn(e));
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text || "");
    toast.success("Copied to clipboard!");
    setShowMenu(false);
  };

  const handleReply = () => {
    dispatch(setReplyingTo({ id: message.id, sender: message.sender, text: message.text }));
    setShowMenu(false);
  };

  const handleEdit = () => {
    dispatch(setEditingMessage({ id: message.id, text: message.text }));
    setShowMenu(false);
  };

  const handleDeleteMe = () => {
    wsService.sendDeleteMessage(activeConversation, message.id, "me");
    setShowMenu(false);
  };

  const handleDeleteEveryone = () => {
    wsService.sendDeleteMessage(activeConversation, message.id, "everyone");
    setShowMenu(false);
  };

  const handleTogglePin = () => {
    wsService.sendTogglePin(activeConversation, message.id);
    setShowMenu(false);
  };

  const handleToggleStar = async () => {
    try {
      const res = await chatService.toggleStar(message.id);
      dispatch(toggleMessageStarStatus({ messageId: message.id, starred: res.starred }));
      toast.success(res.starred ? "Message starred!" : "Message unstarred!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to star message");
    }
    setShowMenu(false);
  };

  const handleReact = (emoji) => {
    wsService.sendReaction(activeConversation, message.id, emoji);
    setShowEmojiPicker(false);
  };

  const scrollToRepliedMessage = (repliedId) => {
    const el = document.getElementById(`msg-${repliedId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-flash');
      setTimeout(() => el.classList.remove('highlight-flash'), 2000);
    } else {
      toast.info("Replied message not found in history.");
    }
  };

  // Group reactions by emoji
  const reactionsGrouped = (message.reactions || []).reduce((acc, current) => {
    acc[current.emoji] = (acc[current.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={`flex w-full flex-col ${message.incoming ? 'items-start' : 'items-end'} mb-2`}>
      {/* Sender name for group chats */}
      {message.incoming && (
        <span className="text-[11px] font-semibold text-[var(--text-muted)] ml-3 mb-0.5">
          {message.sender}
        </span>
      )}

      <div className="group relative flex max-w-[75%] items-center gap-2">
        {/* Actions Menu button (reveals on hover on desktop, or click) */}
        {!message.incoming && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 hover:bg-[var(--bg-glass)] text-[var(--text-muted)] hover:text-[var(--text)] rounded-full border border-transparent hover:border-[var(--border)]"
            >
              <Smile className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-[var(--bg-glass)] text-[var(--text-muted)] hover:text-[var(--text)] rounded-full border border-transparent hover:border-[var(--border)]"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Message Card Container */}
        <div className={`relative rounded-2xl px-4 py-2.5 shadow-sm border border-[var(--border)] transition-all duration-300
          ${message.incoming 
            ? 'bg-[var(--bg-surface-dim)] text-[var(--text)] rounded-tl-sm' 
            : 'bg-[var(--accent-dim)] text-[var(--text)] rounded-tr-sm'
          }
          ${message.is_pinned ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-surface)]' : ''}
        `}>
          
          {/* Pinned Indicator banner inside bubble */}
          {message.is_pinned && (
            <div className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-[var(--accent)] mb-1">
              <Pin className="h-3 w-3 fill-current" /> Pinned
            </div>
          )}

          {/* Replied Message Preview Box */}
          {message.reply_to && (
            <div 
              onClick={() => scrollToRepliedMessage(message.reply_to.id)}
              className="mb-2 cursor-pointer border-l-4 border-[var(--accent)] bg-[var(--bg-surface)] bg-opacity-40 p-2 rounded text-xs select-none hover:bg-opacity-60 transition-all"
            >
              <div className="font-semibold text-[var(--accent)] text-[10px]">
                {message.reply_to.sender}
              </div>
              <div className="text-[var(--text-muted)] truncate max-w-sm">
                {message.reply_to.text || "Attachment"}
              </div>
            </div>
          )}

          {/* Message Text or Attachments or Voice Note */}
          <div className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.voice_note ? (
              // Custom Voice Note Player
              <div className="flex items-center gap-3 min-w-[200px] py-1.5">
                <button 
                  onClick={togglePlayVoiceNote}
                  className="p-2 bg-[var(--accent)] text-white hover:scale-105 rounded-full flex items-center justify-center shadow-md transition-all duration-200"
                >
                  {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                </button>
                <div className="flex-1 flex flex-col gap-1">
                  <audio ref={audioRef} src={message.voice_note} preload="metadata" />
                  <input 
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 accent-[var(--accent)] rounded-lg appearance-none cursor-pointer bg-slate-200"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                    <span>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
                    <span>{duration ? new Date(duration * 1000).toISOString().substr(14, 5) : '0:00'}</span>
                  </div>
                </div>
              </div>
            ) : (
              message.text
            )}

            {/* Attachments rendering */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {message.attachments.map(att => {
                  const isImage = att.mime_type?.startsWith('image/') || att.file_url.match(/\.(jpeg|jpg|gif|png)$/i);
                  const isVideo = att.mime_type?.startsWith('video/') || att.file_url.match(/\.(mp4|webm|ogg)$/i);
                  
                  if (isImage) {
                    return (
                      <a href={att.file_url} target="_blank" rel="noopener noreferrer" key={att.id} className="block overflow-hidden rounded-lg border border-[var(--border)] max-w-xs hover:opacity-90 transition-opacity">
                        <img src={att.file_url} alt={att.file_name} className="object-cover max-h-48 w-full" />
                      </a>
                    );
                  }

                  if (isVideo) {
                    return (
                      <video key={att.id} controls src={att.file_url} className="rounded-lg max-h-48 max-w-xs border border-[var(--border)] bg-black" />
                    );
                  }

                  // General File Download Box
                  return (
                    <a 
                      href={att.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      key={att.id} 
                      className="flex items-center gap-3 bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border)] max-w-xs text-xs text-[var(--text)] hover:bg-opacity-80 transition-all"
                    >
                      <FileText className="h-5 w-5 text-[var(--accent)] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{att.file_name || 'Attached File'}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{(att.file_size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Download className="h-4 w-4 text-[var(--text-muted)] hover:text-[var(--text)] flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Time & Receipt status indicators */}
          <div className="mt-1 flex items-center justify-end gap-1.5 text-[9px] text-[var(--text-muted)] select-none">
            {message.is_edited && <span>(edited)</span>}
            {message.starred && <Star className="h-3 w-3 text-amber-500 fill-current" />}
            <span>{message.time}</span>
            {!message.incoming && (
              message.read ? (
                <CheckCheck className="h-3.5 w-3.5 text-blue-500 font-bold" />
              ) : message.delivered ? (
                <CheckCheck className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              ) : (
                <Check className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              )
            )}
          </div>

          {/* Reactions Overlay at Bottom Corner */}
          {Object.keys(reactionsGrouped).length > 0 && (
            <div className="absolute -bottom-2 right-2 flex items-center gap-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] px-1.5 py-0.5 shadow-sm text-[10px] select-none">
              {Object.entries(reactionsGrouped).map(([emoji, count]) => (
                <span key={emoji} className="flex items-center gap-0.5 cursor-pointer hover:scale-110 transition-transform" onClick={() => handleReact(emoji)}>
                  <span>{emoji}</span>
                  {count > 1 && <span className="text-[8px] font-bold text-[var(--text-muted)]">{count}</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Actions Menu Button */}
        {message.incoming && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-[var(--bg-glass)] text-[var(--text-muted)] hover:text-[var(--text)] rounded-full border border-transparent hover:border-[var(--border)]"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 hover:bg-[var(--bg-glass)] text-[var(--text-muted)] hover:text-[var(--text)] rounded-full border border-transparent hover:border-[var(--border)]"
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Quick Emoji Reaction Box Overlay */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-30 flex items-center gap-1.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full px-2.5 py-1.5 shadow-lg animate-fade-in">
            {EMOJIS.map(emoji => (
              <button 
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-base hover:scale-125 hover:rotate-6 transition-all duration-150"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Message Dropdown Actions Menu */}
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className={`absolute top-full mt-1 w-44 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] py-1.5 shadow-xl z-50 animate-scale-up
              ${message.incoming ? 'left-0' : 'right-0'}`}
            >
              <button onClick={handleReply} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--bg-glass)] transition-all">
                <CornerUpLeft className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Reply
              </button>
              
              {!message.incoming && (
                <button onClick={handleEdit} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--bg-glass)] transition-all">
                  <Edit3 className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Edit Message
                </button>
              )}

              <button onClick={handleTogglePin} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--bg-glass)] transition-all">
                <Pin className="h-3.5 w-3.5 text-[var(--text-muted)]" /> {message.is_pinned ? 'Unpin' : 'Pin Message'}
              </button>

              <button onClick={handleToggleStar} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--bg-glass)] transition-all">
                <Star className="h-3.5 w-3.5 text-[var(--text-muted)]" /> {message.starred ? 'Unstar Message' : 'Star Message'}
              </button>

              <button onClick={handleCopy} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--bg-glass)] transition-all">
                <Copy className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Copy text
              </button>

              <div className="my-1 border-t border-[var(--border)]" />

              <button onClick={handleDeleteMe} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 hover:bg-opacity-5 dark:hover:bg-red-950 dark:hover:bg-opacity-20 transition-all">
                <Trash className="h-3.5 w-3.5" /> Delete for Me
              </button>

              {!message.incoming && (
                <button onClick={handleDeleteEveryone} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 hover:bg-opacity-5 dark:hover:bg-red-950 dark:hover:bg-opacity-20 transition-all">
                  <Trash className="h-3.5 w-3.5" /> Delete for Everyone
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
