import React, { useState, useEffect, useRef } from "react";
import { Smile, Paperclip, Send, X, Mic, Square, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import EmojiPicker from 'emoji-picker-react';
import { addMessage, setReplyingTo, setEditingMessage } from '@/store/slices/chatSlice';
import { chatService } from '@/services/chat.service';
import wsService from '@/services/websocket';

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();
  
  // Redux state
  const { activeConversation, replyingTo, editingMessage } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  // Refs
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);
  const textareaRef = useRef(null);

  // Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const recordingTimerRef = useRef(null);

  // Drag & drop state
  const [isDragActive, setIsDragActive] = useState(false);

  // Auto-focus and populate input on edit message
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.text);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [editingMessage]);

  // Stop typing on chat switch
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current && activeConversation) {
        wsService.sendTypingStop(activeConversation);
        isTypingRef.current = false;
      }
    };
  }, [activeConversation]);

  // Adjust textarea height on change
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Click outside emoji picker to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Voice recording stopwatch timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingTimerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [isRecording]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);

    if (!activeConversation) return;

    if (!isTypingRef.current && val.trim().length > 0) {
      wsService.sendTypingStart(activeConversation);
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        wsService.sendTypingStop(activeConversation);
        isTypingRef.current = false;
      }
    }, 2000);
  };

  const handleSend = () => {
    if ((!message.trim() && !isRecording) || !activeConversation) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      wsService.sendTypingStop(activeConversation);
      isTypingRef.current = false;
    }

    const textToSend = message.trim();
    setMessage("");

    // If we are editing an existing message
    if (editingMessage) {
      wsService.sendEditMessage(activeConversation, editingMessage.id, textToSend);
      dispatch(setEditingMessage(null));
      return;
    }

    // Standard send flow with optimistic UI update
    const tempId = 'pending-' + Date.now();
    const optimisticMessage = {
      id: tempId,
      temp_id: tempId,
      conversation: activeConversation,
      sender: { id: user?.id, username: user?.username },
      text: textToSend,
      is_read: false,
      is_delivered: false,
      created_at: new Date().toISOString(),
      reply_to: replyingTo ? { id: replyingTo.id, sender: replyingTo.sender, text: replyingTo.text } : null,
      attachments: [],
      reactions: [],
      _pending: true,
    };

    dispatch(addMessage({ message: optimisticMessage, isSelf: true }));
    
    try {
      wsService.sendMessage(activeConversation, textToSend, tempId, replyingTo?.id);
      dispatch(setReplyingTo(null));
    } catch (error) {
      console.error("Failed to send message via WebSocket:", error);
      toast.error("Message failed to send");
    }
  };

  // Insert Emoji at Cursor Position
  const handleEmojiSelect = (emojiData) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const emoji = emojiData.emoji;
    const before = message.substring(0, start);
    const after = message.substring(end, message.length);

    setMessage(before + emoji + after);
    setShowEmoji(false);

    // Reposition cursor after inserting emoji
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 10);
  };

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
    }
    e.target.value = null; // Clear file input
  };

  const uploadFiles = async (fileList) => {
    if (!activeConversation) return;
    const files = Array.from(fileList);

    // Limit files to 5MB and allowed extensions
    const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx', '.txt'];
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    for (let file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} exceeds the 5MB size limit.`);
        return;
      }
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`File ${file.name} has an unsupported file format.`);
        return;
      }
    }

    setUploading(true);
    try {
      // Send attachment files via REST API
      const savedMessage = await chatService.sendMessage(activeConversation, '', files);
      
      // Add message locally
      const normalizedMessage = {
        id: savedMessage.id,
        conversation: activeConversation,
        sender: { id: user?.id, username: user?.username },
        text: savedMessage.text,
        is_read: false,
        is_delivered: true,
        created_at: savedMessage.created_at,
        attachments: savedMessage.attachments || [],
        reactions: [],
      };
      
      dispatch(addMessage({ message: normalizedMessage, isSelf: true }));
      toast.success("Attachments uploaded successfully.");
    } catch (err) {
      console.error(err);
      toast.error("File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // Voice Note Recorder Trigger Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all track streams to release the microphone
        stream.getTracks().forEach(track => track.stop());

        if (chunks.length === 0) return;
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const voiceFile = new File([blob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });

        setUploading(true);
        try {
          // Send voice note file via REST API with isVoiceNote flag
          const savedMessage = await chatService.sendMessage(activeConversation, '', [voiceFile], true);
          
          const normalizedMessage = {
            id: savedMessage.id,
            conversation: activeConversation,
            sender: { id: user?.id, username: user?.username },
            text: '',
            voice_note: savedMessage.voice_note,
            is_read: false,
            is_delivered: true,
            created_at: savedMessage.created_at,
            attachments: [],
            reactions: [],
          };
          
          dispatch(addMessage({ message: normalizedMessage, isSelf: true }));
        } catch (err) {
          console.error("Voice note upload failed:", err);
          toast.error("Failed to upload voice note.");
        } finally {
          setUploading(false);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone permission denied or unsupported:", err);
      toast.error("Could not access microphone.");
    }
  };

  const stopAndSendRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      // Discard recorder handlers and clear tracks
      mediaRecorder.onstop = null;
      mediaRecorder.stop();
      setIsRecording(false);
      setAudioChunks([]);
      toast.info("Recording discarded.");
    }
  };

  const formatStopwatch = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <footer 
      onDragEnter={handleDrag} 
      className={`border-t border-[var(--border)] bg-[var(--bg-panel)] p-4 relative transition-all
        ${isDragActive ? 'bg-[var(--accent-dim)] border-dashed border-[var(--accent)] border-2' : ''}`}
    >
      {/* Drag & Drop Overlay */}
      {isDragActive && (
        <div 
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop}
          className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--accent-dim)] bg-opacity-70 text-[var(--accent)] font-semibold text-sm pointer-events-auto"
        >
          Drop files to send attachment...
        </div>
      )}

      {/* Replying-to Preview Bar */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-[var(--bg-surface-dim)] px-4 py-2.5 border-l-4 border-[var(--accent)] rounded-lg mb-3 shadow-inner animate-slide-in">
          <div className="flex-1 min-w-0 text-xs">
            <span className="font-semibold text-[var(--accent)]">Replying to {replyingTo.sender?.username || replyingTo.sender}</span>
            <p className="text-[var(--text-muted)] truncate max-w-2xl">{replyingTo.text || "📎 Attached media"}</p>
          </div>
          <button onClick={() => dispatch(setReplyingTo(null))} className="p-1 hover:bg-[var(--bg-glass-hover)] rounded-full transition">
            <X className="h-4 w-4 text-[var(--text-muted)]" />
          </button>
        </div>
      )}

      {/* Editing-message Preview Bar */}
      {editingMessage && (
        <div className="flex items-center justify-between bg-[var(--bg-surface-dim)] px-4 py-2.5 border-l-4 border-yellow-500 rounded-lg mb-3 shadow-inner animate-slide-in">
          <div className="flex-1 min-w-0 text-xs">
            <span className="font-semibold text-yellow-500">Editing Message</span>
            <p className="text-[var(--text-muted)] truncate max-w-2xl">{editingMessage.text}</p>
          </div>
          <button onClick={() => { dispatch(setEditingMessage(null)); setMessage(""); }} className="p-1 hover:bg-[var(--bg-glass-hover)] rounded-full transition">
            <X className="h-4 w-4 text-[var(--text-muted)]" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3 max-w-5xl mx-auto">
        {/* Emoji picker container */}
        {!isRecording && (
          <div className="relative flex-shrink-0" ref={emojiRef}>
            <button
              type="button"
              onClick={() => setShowEmoji((p) => !p)}
              className="rounded-full p-2.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text)]"
            >
              <Smile className="h-5 w-5" />
            </button>
            {showEmoji && (
              <div className="absolute bottom-14 left-0 z-30 shadow-2xl rounded-xl overflow-hidden animate-scale-up">
                <EmojiPicker
                  theme="dark"
                  onEmojiClick={handleEmojiSelect}
                />
              </div>
            )}
          </div>
        )}

        {/* File Attachments clip button */}
        {!isRecording && (
          <div className="flex-shrink-0">
            <input 
              type="file" 
              multiple 
              hidden 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*,video/*,.pdf,.doc,.docx,.txt" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="rounded-full p-2.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text)] disabled:opacity-40"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Text Input area OR Recording Voice Note display */}
        {isRecording ? (
          // Recording studio layout
          <div className="flex-1 flex items-center justify-between bg-[var(--bg-glass)] border border-red-500 rounded-full px-5 py-2.5">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-500">Recording voice note</span>
            </div>
            <span className="text-sm font-mono text-[var(--text)]">{formatStopwatch(recordingTime)}</span>
            <div className="flex items-center gap-1.5">
              <button 
                type="button" 
                onClick={cancelRecording}
                className="p-1.5 hover:bg-[var(--bg-glass-hover)] rounded-full text-red-500 transition-colors"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
              <button 
                type="button" 
                onClick={stopAndSendRecording}
                className="p-1.5 hover:bg-emerald-600 bg-emerald-500 text-white rounded-full transition-colors"
              >
                <Square className="h-4.5 w-4.5 fill-current" />
              </button>
            </div>
          </div>
        ) : (
          // Standard auto-growing textarea
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="
              flex-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-glass)]
              px-4 py-3 text-sm text-[var(--text)] outline-none resize-none
              placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]
              transition-all duration-200 custom-scrollbar max-h-[120px] self-end
            "
          />
        )}

        {/* Send Button / Microphone trigger Button */}
        <div className="flex-shrink-0">
          {message.trim() || editingMessage ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={uploading}
              className="
                flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-white
                transition hover:scale-105 hover:opacity-90 shadow-md
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
              "
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          ) : (
            !isRecording && (
              <button
                type="button"
                onClick={startRecording}
                disabled={uploading}
                className="
                  flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bg-glass-hover)] text-[var(--text-muted)]
                  transition hover:scale-105 hover:text-[var(--text)] shadow-sm disabled:opacity-40
                "
              >
                <Mic className="h-4.5 w-4.5" />
              </button>
            )
          )}
        </div>
      </div>
    </footer>
  );
};

export default MessageInput;
