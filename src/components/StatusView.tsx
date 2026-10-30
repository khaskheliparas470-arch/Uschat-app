import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { Plus, X, Lock, Send } from 'lucide-react';
import { StatusStory } from '../types/chat';

export const StatusView: React.FC = () => {
  const {
    statusStories = [],
    currentUser,
    postStatusStory,
    sendMessage,
    setActiveChatId,
    setActiveTab,
  } = useChat();

  const [activeStory, setActiveStory] = useState<StatusStory | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [newBgColor, setNewBgColor] = useState('#075e54');
  const [replyText, setReplyText] = useState('');

  // Story playback timer
  useEffect(() => {
    if (!activeStory) {
      setStoryProgress(0);
      return;
    }

    setStoryProgress(0);
    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Advance or close
          const currentIndex = statusStories.findIndex((s) => s.id === activeStory.id);
          if (currentIndex !== -1 && currentIndex < statusStories.length - 1) {
            setActiveStory(statusStories[currentIndex + 1]);
            return 0;
          } else {
            setActiveStory(null);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory, statusStories]);

  const handlePostStory = () => {
    if (!newText.trim() || typeof postStatusStory !== 'function') return;
    postStatusStory('text', newText.trim(), undefined, newBgColor);
    setNewText('');
    setShowCreateModal(false);
  };

  const handleReplyToStory = async () => {
    if (!replyText.trim() || !activeStory) return;
    const targetChatId = `chat_${activeStory.userId.replace('user_', '')}`;
    setActiveChatId(targetChatId);
    setActiveTab('chats');
    if (typeof sendMessage === 'function') {
      await sendMessage(`Replied to status: "${replyText.trim()}"`);
    }
    setActiveStory(null);
    setReplyText('');
  };

  const bgColors = ['#075e54', '#128c7e', '#1f2937', '#7c3aed', '#b91c1c', '#0369a1'];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Status Updates
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          End-to-end encrypted 24h ephemeral updates
        </p>
      </div>

      <div className="max-w-xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* My Status Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name || 'User'}
                referrerPolicy="no-referrer"
                className="w-12 h-12 sm:w-13 sm:h-13 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
              />
              <button
                onClick={() => setShowCreateModal(true)}
                className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-600 rounded-full text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs"
                title="Create Status"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                My Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tap to share an encrypted story
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-xs active:scale-95"
          >
            Create
          </button>
        </div>

        {/* Recent Updates */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Recent Updates
          </h4>

          <div className="bg-white dark:bg-slate-900 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {statusStories.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No recent status updates found.</p>
              </div>
            ) : (
              statusStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => setActiveStory(story)}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="relative p-0.5 rounded-full ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900">
                    <img
                      src={story.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={story.userName || 'Contact'}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover shadow-xs"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {story.userName || 'Unknown'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {story.timestamp ? new Date(story.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'Recent'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* E2EE Security Footnote */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 pt-2 pb-6">
          <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">Your status updates are protected by end-to-end encryption.</span>
        </div>
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in text-white">
          <div className="relative w-full max-w-sm h-[80vh] max-h-[640px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10">
            {/* Background Content */}
            {activeStory.type === 'text' ? (
              <div
                className="absolute inset-0 z-0 flex items-center justify-center p-8 text-center text-lg font-bold leading-relaxed shadow-inner"
                style={{ backgroundColor: activeStory.backgroundColor || '#075e54' }}
              >
                {activeStory.content}
              </div>
            ) : (
              <div className="absolute inset-0 z-0 bg-slate-900">
                <img
                  src={activeStory.content || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'}
                  alt={activeStory.caption || 'Status story'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
              </div>
            )}

            {/* Top Bar with progress bar */}
            <div className="relative z-10 p-4 space-y-3 bg-gradient-to-b from-black/70 to-transparent">
              {/* Progress Line */}
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${storyProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeStory.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={activeStory.userName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-white/30 shadow-xs"
                  />
                  <div>
                    <p className="text-xs font-bold">{activeStory.userName || 'Peer'}</p>
                    <p className="text-[10px] text-white/70 font-medium">
                      {activeStory.timestamp ? new Date(activeStory.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'Recent'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom Caption & Reply Bar */}
            <div className="relative z-10 p-4 bg-gradient-to-t from-black/90 to-transparent space-y-3">
              {activeStory.caption && (
                <p className="text-xs text-white/95 text-center font-bold">
                  {activeStory.caption}
                </p>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Reply to encrypted status..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReplyToStory()}
                  className="flex-1 px-4 py-2.5 bg-white/20 backdrop-blur-md rounded-full text-xs text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white border border-white/20"
                />
                <button
                  onClick={handleReplyToStory}
                  className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-transform"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Status Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                Create Status Update
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div
                className="w-full h-44 rounded-2xl flex items-center justify-center p-6 text-center transition-colors shadow-inner"
                style={{ backgroundColor: newBgColor }}
              >
                <textarea
                  placeholder="Type a status update..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  maxLength={180}
                  className="w-full bg-transparent text-white placeholder:text-white/60 text-base font-bold text-center focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              {/* Palette */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Background Color
                </label>
                <div className="flex items-center gap-2.5">
                  {bgColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewBgColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform shadow-xs ${
                        newBgColor === c ? 'scale-110 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!newText.trim()}
                  onClick={handlePostStory}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
                >
                  Post Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
