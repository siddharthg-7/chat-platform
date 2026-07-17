import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { 
  X, 
  Camera, 
  Edit2, 
  Check, 
  UserPlus, 
  LogOut, 
  Crown, 
  MoreVertical, 
  FileText, 
  Image as ImageIcon,
  UserCheck,
  Trash2
} from "lucide-react";
import { toast } from 'sonner';
import { Avatar } from "@/components/ui/Avatar";
import { setRightSidebar, setConversations, removeConversation } from "@/store/slices/chatSlice";
import { chatService } from "@/services/chat.service";

const ChatRightSidebar = ({ type }) => {
  const dispatch = useDispatch();
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Redux state
  const { activeConversation, conversations, messages } = useSelector((state) => state.chat);
  const { user: currentUser } = useSelector((state) => state.auth);

  // Local state
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [activeMemberMenu, setActiveMemberMenu] = useState(null);

  // Find active chat details
  const chat = conversations.find(c => c.id === activeConversation);
  
  // Find other user in direct chat
  const otherUser = chat?.participants?.find(p => p.username !== currentUser?.username);

  // Check if current user is admin
  const isUserAdmin = chat?.is_group && (
    chat.admin?.id === currentUser?.id || 
    chat.admins?.some(a => a.id === currentUser?.id)
  );

  useEffect(() => {
    if (chat && chat.is_group) {
      setGroupName(chat.name || "");
    }
  }, [chat]);

  // Load all users for adding to group
  useEffect(() => {
    if (showAddMember) {
      chatService.searchUsers("").then(data => {
        // Filter out users already in the group
        const existingIds = chat.participants.map(p => p.id);
        const filtered = data.filter(u => !existingIds.includes(u.id));
        setAllUsers(filtered);
      }).catch(console.error);
    }
  }, [showAddMember, chat]);

  if (!chat) return null;

  const handleClose = () => {
    dispatch(setRightSidebar({ open: false, type: null }));
  };

  // Group Details Update
  const handleUpdateName = async () => {
    if (!groupName.trim() || groupName.trim() === chat.name) {
      setIsEditingName(false);
      return;
    }
    try {
      const updated = await chatService.updateGroup(chat.id, groupName.trim());
      // Update conversations list in Redux
      const updatedList = conversations.map(c => c.id === chat.id ? { ...c, name: updated.name } : c);
      dispatch(setConversations(updatedList));
      setIsEditingName(false);
      toast.success("Group renamed successfully.");
    } catch {
      toast.error("Failed to rename group.");
    }
  };

  const handleFileChange = async (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.info(`Uploading group ${fileType}...`);
      const updated = fileType === "avatar" 
        ? await chatService.updateGroup(chat.id, null, file, null)
        : await chatService.updateGroup(chat.id, null, null, file);

      const updatedList = conversations.map(c => 
        c.id === chat.id 
          ? { ...c, avatar: updated.avatar, cover: updated.cover } 
          : c
      );
      dispatch(setConversations(updatedList));
      toast.success(`Group ${fileType} updated successfully.`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to upload ${fileType}.`);
    }
  };

  // Member management actions
  const handleMemberAction = async (userId, action) => {
    setActiveMemberMenu(null);
    try {
      const updated = await chatService.groupMemberAction(chat.id, userId, action);
      const updatedList = conversations.map(c => c.id === chat.id ? updated : c);
      dispatch(setConversations(updatedList));
      toast.success(`User ${action === 'promote' ? 'promoted to admin' : 'removed'} successfully.`);
    } catch {
      toast.error("Action failed.");
    }
  };

  const handleAddMember = async (userId) => {
    setShowAddMember(false);
    try {
      const updated = await chatService.groupMemberAction(chat.id, userId, "add");
      const updatedList = conversations.map(c => c.id === chat.id ? updated : c);
      dispatch(setConversations(updatedList));
      toast.success("Member added to group.");
    } catch {
      toast.error("Failed to add member.");
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      await chatService.leaveGroup(chat.id);
      dispatch(removeConversation(chat.id));
      dispatch(setRightSidebar({ open: false, type: null }));
      toast.success("You left the group.");
    } catch {
      toast.error("Failed to leave group.");
    }
  };

  // Scan current active messages in Redux for shared images and videos
  const sharedMedia = messages.filter(m => m.attachments && m.attachments.length > 0)
    .flatMap(m => m.attachments)
    .filter(att => att.mime_type?.startsWith('image/') || att.mime_type?.startsWith('video/') || att.file_url.match(/\.(jpeg|jpg|gif|png|mp4|webm)$/i));

  return (
    <div className="h-full flex flex-col bg-[var(--bg-panel)] overflow-hidden text-[var(--text)]">
      {/* Header bar */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4 shrink-0">
        <h3 className="font-semibold text-sm">
          {type === 'group_info' ? 'Group Details' : 'Contact Info'}
        </h3>
        <button onClick={handleClose} className="p-1.5 hover:bg-[var(--bg-glass-hover)] rounded-full transition">
          <X className="h-4.5 w-4.5 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Main panel scroll container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pb-6">
        
        {/* Cover Photo / Header Banner */}
        <div className="relative h-32 w-full bg-slate-800 shrink-0 overflow-hidden">
          {type === 'group_info' ? (
            chat.cover ? (
              <img src={chat.cover} alt="Group Cover" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-slate-800 to-indigo-900" />
            )
          ) : (
            otherUser?.profile?.cover_photo ? (
              <img src={otherUser.profile.cover_photo} alt="User Cover" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-slate-800 to-indigo-900" />
            )
          )}

          {/* Cover edit controls (only for Group Admin) */}
          {type === 'group_info' && isUserAdmin && (
            <button 
              onClick={() => coverInputRef.current.click()}
              className="absolute bottom-2 right-2 p-1.5 bg-black bg-opacity-60 text-white rounded-full hover:scale-105 transition shadow-md"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          )}
          <input type="file" ref={coverInputRef} hidden onChange={(e) => handleFileChange(e, "cover")} accept="image/*" />
        </div>

        {/* Profile Avatar & Details Section */}
        <div className="flex flex-col items-center -mt-12 px-4 mb-6 shrink-0 relative">
          <div className="relative hover:scale-102 transition duration-200">
            {type === 'group_info' ? (
              <Avatar src={chat.avatar} fallback={chat.name?.substring(0, 2)} className="h-24 w-24 border-4 border-[var(--bg-panel)] shadow-xl" />
            ) : (
              <Avatar src={otherUser?.profile?.avatar} fallback={otherUser?.username?.substring(0, 2)} className="h-24 w-24 border-4 border-[var(--bg-panel)] shadow-xl" />
            )}

            {/* Avatar edit controls (only for Group Admin) */}
            {type === 'group_info' && isUserAdmin && (
              <button 
                onClick={() => avatarInputRef.current.click()}
                className="absolute bottom-0 right-0 p-2 bg-[var(--accent)] text-white rounded-full hover:scale-105 transition shadow-lg"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
            <input type="file" ref={avatarInputRef} hidden onChange={(e) => handleFileChange(e, "avatar")} accept="image/*" />
          </div>

          {/* Group / User Name Info */}
          <div className="mt-3 text-center w-full">
            {type === 'group_info' ? (
              isEditingName ? (
                <div className="flex items-center gap-1.5 max-w-[240px] mx-auto">
                  <input 
                    type="text" 
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="flex-1 bg-[var(--bg-glass)] border border-[var(--accent)] rounded-lg px-2.5 py-1 text-sm outline-none text-center"
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                  />
                  <button onClick={handleUpdateName} className="p-1 bg-[var(--accent)] text-white rounded-lg hover:scale-105 transition">
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <h4 className="font-bold text-base truncate max-w-[200px]">{chat.name}</h4>
                  {isUserAdmin && (
                    <button onClick={() => setIsEditingName(true)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text)] transition">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )
            ) : (
              <>
                <h4 className="font-bold text-base">{otherUser?.username}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{otherUser?.email}</p>
                {otherUser?.profile?.is_online ? (
                  <span className="text-[10px] text-[var(--accent)] font-semibold uppercase mt-1 inline-block">Online</span>
                ) : (
                  <span className="text-[10px] text-[var(--text-muted)] mt-1 inline-block">
                    Last seen {otherUser?.profile?.last_seen ? new Date(otherUser.profile.last_seen).toLocaleDateString() : 'recently'}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Group Members Section */}
        {type === 'group_info' && (
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Members ({chat.participants?.length || 0})
              </span>
              {isUserAdmin && (
                <button 
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline font-semibold"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Add
                </button>
              )}
            </div>

            {/* Modal-like popover to add member */}
            {showAddMember && (
              <div className="bg-[var(--bg-surface-dim)] border border-[var(--border)] rounded-xl p-3 mb-3 shadow-inner max-h-48 overflow-y-auto custom-scrollbar animate-slide-in">
                <div className="flex justify-between items-center mb-2 border-b border-[var(--border)] pb-1.5">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Add Member</span>
                  <button onClick={() => setShowAddMember(false)} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                {allUsers.length === 0 ? (
                  <p className="text-[10px] text-[var(--text-muted)] text-center py-2">No other contacts to add.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {allUsers.map(u => (
                      <div key={u.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="truncate font-medium">{u.username}</span>
                        <button 
                          onClick={() => handleAddMember(u.id)}
                          className="px-2 py-0.5 bg-[var(--accent)] text-white rounded hover:opacity-90 text-[10px]"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Members List */}
            <div className="flex flex-col gap-2.5">
              {chat.participants?.map(member => {
                const isMemberCreator = chat.admin?.id === member.id;
                const isMemberAdmin = chat.admins?.some(a => a.id === member.id) || isMemberCreator;
                const showActions = isUserAdmin && member.id !== currentUser?.id && !isMemberCreator;

                return (
                  <div key={member.id} className="flex items-center justify-between gap-2 text-xs relative">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar src={member.profile?.avatar} fallback={member.username.substring(0,2)} className="h-7 w-7 border border-[var(--border)]" />
                      <div className="min-w-0 flex flex-col">
                        <span className="font-semibold truncate">{member.username}</span>
                        {isMemberCreator ? (
                          <span className="text-[8px] text-amber-500 font-bold uppercase tracking-wide flex items-center gap-0.5">
                            <Crown className="h-2.5 w-2.5 fill-current" /> Creator
                          </span>
                        ) : isMemberAdmin ? (
                          <span className="text-[8px] text-[var(--accent)] font-semibold uppercase tracking-wide">Admin</span>
                        ) : null}
                      </div>
                    </div>

                    {/* Member actions menu (only for group admins) */}
                    {showActions && (
                      <div>
                        <button 
                          onClick={() => setActiveMemberMenu(activeMemberMenu === member.id ? null : member.id)}
                          className="p-1 hover:bg-[var(--bg-glass-hover)] rounded-full transition"
                        >
                          <MoreVertical className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        </button>
                        
                        {activeMemberMenu === member.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setActiveMemberMenu(null)} />
                            <div className="absolute right-0 top-6 z-40 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg py-1 shadow-lg w-32 animate-scale-up">
                              {!isMemberAdmin && (
                                <button 
                                  onClick={() => handleMemberAction(member.id, "promote")}
                                  className="flex w-full items-center gap-1.5 px-2.5 py-1.5 hover:bg-[var(--bg-glass-hover)] text-[10px] font-semibold text-[var(--text)] transition"
                                >
                                  <UserCheck className="h-3 w-3" /> Make Admin
                                </button>
                              )}
                              <button 
                                onClick={() => handleMemberAction(member.id, "remove")}
                                className="flex w-full items-center gap-1.5 px-2.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950 dark:hover:bg-opacity-20 text-[10px] font-semibold text-red-500 transition"
                              >
                                <Trash2 className="h-3 w-3" /> Remove member
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Shared Media Section */}
        <div className="px-4">
          <div className="flex items-center gap-1.5 mb-3">
            <ImageIcon className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Shared Media ({sharedMedia.length})
            </span>
          </div>

          {sharedMedia.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] text-center py-4 border border-[var(--border)] rounded-xl border-dashed">
              No shared media found.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {sharedMedia.map((att, idx) => (
                <a 
                  key={att.id || idx} 
                  href={att.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="aspect-square rounded-lg border border-[var(--border)] overflow-hidden hover:opacity-90 transition shadow-sm bg-black flex items-center justify-center"
                >
                  {att.mime_type?.startsWith('video/') || att.file_url.match(/\.(mp4|webm)$/i) ? (
                    <video src={att.file_url} className="h-full w-full object-cover" />
                  ) : (
                    <img src={att.file_url} alt="Shared attachment" className="h-full w-full object-cover" />
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Leave Group trigger (only for Groups) */}
        {type === 'group_info' && (
          <div className="px-4 mt-8 shrink-0">
            <button 
              onClick={handleLeaveGroup}
              className="w-full py-2.5 border border-red-500 border-opacity-30 text-red-500 hover:bg-red-50 hover:bg-opacity-5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <LogOut className="h-4 w-4" /> Leave Group
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ChatRightSidebar;

