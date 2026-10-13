import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import {
  X,
  ShieldCheck,
  Clock,
  UserPlus,
  MoreVertical,
  LogOut,
  Trash2,
  Lock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const GroupInfoDrawer: React.FC = () => {
  const {
    showGroupInfo,
    setShowGroupInfo,
    activeChat,
    currentUser,
    allUsers,
    updateGroupParticipants,
    updateDisappearingMessages,
    setSafetyNumberChat,
    deleteMessage,
  } = useChat();

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedAddUserId, setSelectedAddUserId] = useState<string>('');
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  if (!showGroupInfo || !activeChat) return null;

  const isCurrentUserAdmin = activeChat.participants?.some(
    (p) => p.userId === currentUser.id && p.role === 'admin'
  );

  const nonParticipantUsers = allUsers.filter(
    (u) => !activeChat.participants?.some((p) => p.userId === u.id)
  );

  const handleAddParticipant = async () => {
    if (!selectedAddUserId) return;
    await updateGroupParticipants(activeChat.id, 'add', selectedAddUserId);
    setSelectedAddUserId('');
    setIsAddingUser(false);
  };

  const handleDisappearingChange = (seconds: number) => {
    updateDisappearingMessages(activeChat.id, seconds);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
          {activeChat.isGroup ? 'Group Information' : 'Contact Details'}
        </h3>
        <button
          onClick={() => setShowGroupInfo(false)}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {/* Profile Card */}
        <div className="p-6 flex flex-col items-center text-center space-y-3">
          <img
            src={activeChat.avatar}
            alt={activeChat.name}
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {activeChat.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeChat.isGroup
                ? `Group · ${activeChat.participants?.length || 0} participants`
                : 'Encrypted Contact'}
            </p>
          </div>
          {activeChat.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {activeChat.description}
            </p>
          )}
        </div>

        {/* Security & Encryption Section */}
        <div className="p-5 space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Encryption & Security
          </h4>

          <div
            onClick={() => setSafetyNumberChat(activeChat)}
            className="flex items-center justify-between p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  End-to-End Encrypted
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tap to verify 60-digit safety numbers
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Session Ratchet Key</span>
            </div>
            <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {activeChat.symmetricKey}
            </p>
          </div>
        </div>

        {/* Disappearing Messages */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Disappearing Messages
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            When enabled, new messages sent in this chat disappear after the chosen duration.
          </p>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Off', sec: 0 },
              { label: '24 hrs', sec: 86400 },
              { label: '7 days', sec: 604800 },
              { label: '90 days', sec: 7776000 },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleDisappearingChange(opt.sec)}
                className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all ${
                  activeChat.disappearingMessageDuration === opt.sec
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Participants (Groups Only) */}
        {activeChat.isGroup && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {activeChat.participants?.length} Participants
              </h4>
              {isCurrentUserAdmin && (
                <button
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add member</span>
                </button>
              )}
            </div>

            {/* Add member sub-drawer */}
            {isAddingUser && (
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Select Contact to Add:
                </p>
                <select
                  value={selectedAddUserId}
                  onChange={(e) => setSelectedAddUserId(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <option value="">-- Choose contact --</option>
                  {nonParticipantUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.phone})
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsAddingUser(false)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!selectedAddUserId}
                    onClick={handleAddParticipant}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                  >
                    Confirm & Ratchet Key
                  </button>
                </div>
              </div>
            )}

            {/* Participant list */}
            <div className="space-y-1.5 pt-1">
              {activeChat.participants?.map((p) => {
                const user = allUsers.find((u) => u.id === p.userId);
                if (!user) return null;
                const isUserAdmin = p.role === 'admin';
                const isMe = user.id === currentUser.id;

                return (
                  <div
                    key={p.userId}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/60 group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {user.name} {isMe && '(You)'}
                          </p>
                          {isUserAdmin && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                          {user.about}
                        </p>
                      </div>
                    </div>

                    {/* Admin actions menu */}
                    {isCurrentUserAdmin && !isMe && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id)
                          }
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuUserId === user.id && (
                          <div className="absolute right-0 top-6 z-20 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs">
                            {isUserAdmin ? (
                              <button
                                onClick={() => {
                                  updateGroupParticipants(activeChat.id, 'demote', user.id);
                                  setActiveMenuUserId(null);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                              >
                                Dismiss as admin
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  updateGroupParticipants(activeChat.id, 'promote', user.id);
                                  setActiveMenuUserId(null);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                              >
                                Make group admin
                              </button>
                            )}

                            <button
                              onClick={() => {
                                updateGroupParticipants(activeChat.id, 'remove', user.id);
                                setActiveMenuUserId(null);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 font-medium"
                            >
                              Remove from group
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="p-5 space-y-2">
          {activeChat.isGroup ? (
            <button
              onClick={() => {
                updateGroupParticipants(activeChat.id, 'remove', currentUser.id);
                setShowGroupInfo(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Group</span>
            </button>
          ) : (
            <button
              onClick={() => setShowGroupInfo(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Chat History</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
