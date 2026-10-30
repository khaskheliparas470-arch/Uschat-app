import React from 'react';
import { useChat } from '../context/ChatContext';
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const CallsView: React.FC = () => {
  const { callLogs = [], chats = [], startCall } = useChat();

  const handleStartCall = (targetId: string, type: 'audio' | 'video') => {
    if (!chats || chats.length === 0) return;
    const targetChat = chats.find(
      (c) => c.id === targetId || (!c.isGroup && c.otherUserId === targetId)
    );
    if (targetChat && typeof startCall === 'function') {
      startCall(targetChat, type);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Encrypted Calls
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          End-to-end encrypted audio and video relay logs
        </p>
      </div>

      <div className="max-w-xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Security Banner */}
        <div className="bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Zero-Knowledge Voice & Video Channels
            </h4>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
              Every packet is encrypted peer-to-peer using AES-256-GCM. No eavesdropping is possible.
            </p>
          </div>
        </div>

        {/* Call Logs Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Recent Calls
          </h4>

          <div className="bg-white dark:bg-slate-900 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {callLogs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No recent call history found.</p>
              </div>
            ) : (
              callLogs.map((log) => {
                const isIncoming = log.direction === 'incoming';
                const isMissed = log.direction === 'missed';

                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={log.contactAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={log.contactName || 'Contact'}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {log.contactName || 'Unknown User'}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs mt-0.5">
                          {isMissed ? (
                            <PhoneMissed className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          ) : isIncoming ? (
                            <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <PhoneOutgoing className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          )}
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {log.timestamp ? new Date(log.timestamp).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            }) : 'Recent'}
                            {log.duration ? ` · ${log.duration}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick call buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => handleStartCall(log.contactId, 'audio')}
                        className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 transition-colors active:scale-95"
                        title="Audio Call"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStartCall(log.contactId, 'video')}
                        className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 transition-colors active:scale-95"
                        title="Video Call"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* E2EE Info Footer */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 pt-2 pb-6">
          <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">Call logs and peer keys remain on-device only.</span>
        </div>
      </div>
    </div>
  );
};
