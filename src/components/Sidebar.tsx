import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import {
  MessageSquare,
  Users,
  Phone,
  CircleDot,
  Search,
  CheckCheck,
  Check,
  Moon,
  Sun,
  Shield,
  ShieldAlert,
  ChevronDown,
  UserCheck,
  Lock,
  Clock,
  Mic,
} from 'lucide-react';
import { Chat } from '../types/chat';

export const Sidebar: React.FC = () => {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    currentUser,
    allUsers,
    switchCurrentUser,
    setShowNewGroupModal,
    setShowNewChatModal,
    inspectEncryptionMode,
    setInspectEncryptionMode,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'groups'>('all');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const filteredChats = chats.filter((chat) => {
    // Search query
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage?.plaintext.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'unread') return chat.unreadCount > 0;
    if (filterType === 'groups') return chat.isGroup;
    return true;
  });

  const formatMessageTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full md:w-96 lg:w-[420px] h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
      {/* Top Header */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        {/* User Profile & Identity Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-left"
            title="Switch User Identity"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[100px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                {currentUser.publicKeyFingerprint.slice(0, 8)}
              </span>
            </div>
          </button>

          {/* User Switcher Dropdown */}
          {showUserDropdown && (
            <div className="absolute left-0 top-13 z-50 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 animate-fade-in">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test Peer Identity Switcher
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Simulate chatting between different user nodes
                </p>
              </div>
              <div className="py-1 max-h-56 overflow-y-auto">
                {allUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchCurrentUser(user.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors ${
                      user.id === currentUser.id
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-600 font-semibold'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="text-xs truncate">{user.name}</span>
                    </div>
                    {user.id === currentUser.id && (
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* E2EE Inspector toggle */}
          <button
            onClick={() => setInspectEncryptionMode(!inspectEncryptionMode)}
            className={`p-2 rounded-xl transition-all ${
              inspectEncryptionMode
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
            title={inspectEncryptionMode ? 'Inspect Mode Active' : 'Inspect Raw Ciphertext'}
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* New Group */}
          <button
            onClick={() => setShowNewGroupModal(true)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Create New Encrypted Group"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* New Chat */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Start New Chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Tabs (Chats, Status, Calls) */}
      <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('chats')}
          className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'chats'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chats</span>
        </button>

        <button
          onClick={() => setActiveTab('status')}
          className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'status'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <CircleDot className="w-4 h-4" />
          <span>Status</span>
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'calls'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Calls</span>
        </button>
      </div>

      {/* Chat Specific Search & Filters */}
      {activeTab === 'chats' && (
        <>
          {/* Search bar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search or start new encrypted chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {(['all', 'unread', 'groups'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all whitespace-nowrap ${
                  filterType === type
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                No encrypted conversations found.
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isActive = chat.id === activeChatId;
                const isTyping = chat.typingUsers && chat.typingUsers.length > 0;
                const lastMsg = chat.lastMessage;
                const isOutgoing = lastMsg?.senderId === currentUser.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-emerald-50/70 dark:bg-slate-800 border-l-4 border-emerald-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-850/60'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-750"
                      />
                      {chat.isGroup ? (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white dark:border-slate-900">
                          <Users className="w-2.5 h-2.5 text-emerald-400" />
                        </div>
                      ) : null}
                    </div>

                    {/* Chat details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {chat.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">
                          {formatMessageTime(lastMsg?.timestamp || chat.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate max-w-[210px]">
                          {isTyping ? (
                            <span className="text-emerald-500 font-medium animate-pulse">
                              {chat.typingUsers?.[0]} is typing...
                            </span>
                          ) : (
                            <>
                              {isOutgoing && (
                                <span className="shrink-0 text-emerald-500">
                                  {lastMsg?.status === 'read' ? (
                                    <CheckCheck className="w-3.5 h-3.5" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                </span>
                              )}
                              {lastMsg?.type === 'voice' && (
                                <Mic className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              )}
                              <span className="truncate">
                                {lastMsg?.plaintext || 'Encrypted conversation started'}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Badges / indicators */}
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {chat.disappearingMessageDuration > 0 && (
                            <Clock className="w-3 h-3 text-slate-400" />
                          )}
                          {chat.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Footer Security Pill */}
      <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>UsChat E2EE Protocol</span>
        </div>
        <span className="font-mono text-[10px]">AES-256-GCM</span>
      </div>
    </div>
  );
};
