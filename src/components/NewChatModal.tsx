import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { X, MessageSquare, Search, Shield, UserPlus } from 'lucide-react';
import { generateSymmetricKey } from '../crypto/encryption';
import { Chat } from '../types/chat';

export const NewChatModal: React.FC = () => {
  const {
    showNewChatModal,
    setShowNewChatModal,
    allUsers = [],
    currentUser,
    chats = [],
    setActiveChatId,
    setShowNewGroupModal,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');

  if (!showNewChatModal) return null;

  const filteredUsers = allUsers.filter(
    (u) =>
      currentUser &&
      u.id !== currentUser.id &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery) ||
        u.about.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startChatWithUser = async (targetUser: typeof allUsers[0]) => {
    // Check if chat already exists
    const existing = chats.find(
      (c) => !c.isGroup && c.otherUserId === targetUser.id
    );

    if (existing) {
      setActiveChatId(existing.id);
      setShowNewChatModal(false);
      return;
    }

    // Otherwise create new 1-on-1 chat
    const { rawKey } = await generateSymmetricKey();
    const newChat: Chat = {
      id: `chat_${targetUser.id}`,
      isGroup: false,
      name: targetUser.name,
      avatar: targetUser.avatar,
      otherUserId: targetUser.id,
      participants: [],
      unreadCount: 0,
      disappearingMessageDuration: 0,
      symmetricKey: rawKey,
      createdAt: Date.now(),
    };

    // Activate it directly
    setActiveChatId(newChat.id);
    setShowNewChatModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                New Encrypted Chat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Select a verified contact
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNewChatModal(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, phone or fingerprint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Action: New Group Shortcut */}
        <div className="px-4 pt-3">
          <button
            onClick={() => {
              setShowNewChatModal(false);
              setShowNewGroupModal(true);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition-colors border border-emerald-500/20 shadow-xs"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <span>Create New Encrypted Group</span>
          </button>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-3">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No verified contacts found.</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => startChatWithUser(user)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                    />
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[170px] font-medium">
                      {user.about || 'Available'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-mono text-[10px] font-semibold">{user.publicKeyFingerprint || 'AES-256'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
