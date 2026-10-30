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
} from 'lucide-react';

export const GroupInfoDrawer: React.FC = () => {
  const {
    showGroupInfo,
    setShowGroupInfo,
    activeChat,
    currentUser,
    allUsers = [],
    updateGroupParticipants,
    updateDisappearingMessages,
    setSafetyNumberChat,
  } = useChat();

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedAddUserId, setSelectedAddUserId] = useState<string>('');
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  if (!showGroupInfo || !activeChat) return null;

  const participantsList = activeChat.participants || [];
  const isCurrentUserAdmin = participantsList.some(
    (p) => p.userId === currentUser?.id && p.role === 'admin'
  );

  const nonParticipantUsers = allUsers.filter(
    (u) => !participantsList.some((p) => p.userId === u.id)
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
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-left select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-xs">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
          {activeChat.isGroup ? 'Group Information' : 'Contact Details'}
        </h3>
        <button
          onClick={() => setShowGroupInfo(false)}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        
        {/* Profile Card */}
        <div className="p-6 flex flex-col items-center text-center space-y-3">
          <img
            src={activeChat.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={activeChat.name}
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-lg"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {activeChat.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {activeChat.isGroup
                ? `Group · ${participantsList.length} participants`
                : 'Encrypted Contact'}
            </p>
          </div>
          {activeChat.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              {activeChat.description}
            </p>
          )}
        </div>

        {/* Security & Encryption Section */}
        <div className="p-5 space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Encryption & Security
          </h4>

          <div
            onClick={() => setSafetyNumberChat(activeChat)}
            className="flex items-center justify-between p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30 cursor-pointer transition-colors shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  End-to-End Encrypted
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Tap to verify 60-digit safety numbers
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Session Ratchet Key</span>
            </div>
            <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {activeChat.symmetricKey || 'aes-256-gcm-master-ratchet-key-active'}
            </p>
          </div>
        </div>

        {/* Disappearing Messages */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Disappearing Messages
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 px-1 font-medium">
            When enabled, new messages sent in this chat disappear after the chosen duration.
          </p>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { label: 'Off', sec: 0 },
              { label: '24 hrs', sec: 86400 },
              { label: '7 days', sec: 604800 },
              { label: '90 days', sec: 7776000 },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleDisappearingChange(opt.sec)}
                className={`py-2.5 px-1 text-center rounded-xl text-xs font-semibold transition-all shadow-xs ${
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
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {participantsList.length} Participants
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
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Contact to Add:
                </p>
                <select
                  value={selectedAddUserId}
                  onChange={(e) => setSelectedAddUserId(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Cancel
                  </button
