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
  const { callLogs, chats, startCall } = useChat();

  const handleStartCall = (targetId: string, type: 'audio' | 'video') => {
    const targetChat = chats.find(
      (c) => c.id === targetId || (!c.isGroup && c.otherUserId === targetId)
    );
    if (targetChat) {
      startCall(targetChat, type);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Encrypted Calls
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          End-to-end encrypted audio and video relay logs
        </p>
      </div>

      <div className="max-w-xl mx-auto w-full p-6 space-y-6">
        {/* Security Banner */}
        <div className="bg-emerald-500/10 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
              Zero-Knowledge Voice & Video Channels
            </h4>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
              Every packet is encrypted peer-to-peer using AES-256-GCM. No eavesdropping is possible.
            </p>
          </div>
        </div>

        {/* Call Logs */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Recent Calls
          </h4>

          <div className="bg-white dark:bg-slate-850 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
            {callLogs.map((log) => {
              const isIncoming = log.direction === 'incoming';
              const isMissed = log.direction === 'missed';

              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={log.contactAvatar}
                      alt={log.contactName}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {log.contactName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs mt-0.5">
                        {isMissed ? (
                          <PhoneMissed className="w-3.5 h-3.5 text-rose-500" />
                        ) : isIncoming ? (
                          <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <PhoneOutgoing className="w-3.5 h-3.5 text-sky-500" />
                        )}
                        <span className="text-slate-500 dark:text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                          {log.duration ? ` · ${log.duration}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick call buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartCall(log.contactId, 'audio')}
                      className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-750 text-emerald-600 dark:text-emerald-400 transition-colors"
                      title="Audio Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStartCall(log.contactId, 'video')}
                      className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-750 text-emerald-600 dark:text-emerald-400 transition-colors"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* E2EE Info */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 pt-4">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Call logs and peer keys remain on-device only.</span>
        </div>
      </div>
    </div>
  );
};
