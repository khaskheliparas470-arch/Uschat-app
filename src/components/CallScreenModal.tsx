import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Lock,
} from 'lucide-react';

export const CallScreenModal: React.FC = () => {
  const { activeCall, endCall } = useChat();
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(activeCall?.type === 'video');
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    if (!activeCall) return;
    setIsVideoEnabled(activeCall.type === 'video');
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCall]);

  if (!activeCall) return null;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-fade-in text-white">
      <div className="relative w-full max-w-md h-[85vh] max-h-[720px] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Background gradient or video effect */}
        {isVideoEnabled ? (
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
            {/* Simulated camera background */}
            <div className="text-center p-8 opacity-40">
              <div className="w-24 h-24 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                <Video className="w-10 h-10 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-300">Encrypted video feed active (720p 60fps)</p>
            </div>
            {/* Small self-view overlay in the corner */}
            <div className="absolute top-16 right-4 w-28 h-40 bg-slate-800/90 rounded-2xl border border-slate-700 overflow-hidden shadow-lg flex items-center justify-center">
              <p className="text-[10px] text-slate-400 font-medium">You</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-950" />
        )}

        {/* Top Info Bar */}
        <div className="relative z-10 p-6 flex flex-col items-center text-center space-y-3">
          {/* E2EE Lock Banner */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[11px] text-emerald-400 font-medium">
            <Lock className="w-3 h-3" />
            <span>End-to-End Encrypted Call</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {activeCall.name}
            </h2>
            <p className="text-xs text-emerald-400/90 font-mono mt-1">
              {duration === 0 ? 'Connecting...' : timeFormatted}
            </p>
          </div>
        </div>

        {/* Center: Contact Avatar or Visual Pulse */}
        {!isVideoEnabled && (
          <div className="relative z-10 flex flex-col items-center justify-center py-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-60 scale-125" />
              <img
                src={activeCall.avatar}
                alt={activeCall.name}
                referrerPolicy="no-referrer"
                className="relative w-32 h-32 rounded-full object-cover border-4 border-emerald-500/30 shadow-2xl"
              />
            </div>
            {activeCall.isGroup && (
              <span className="mt-4 text-xs text-slate-400">Group Audio Call</span>
            )}
          </div>
        )}

        {/* Bottom Call Controls */}
        <div className="relative z-10 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center gap-5">
            {/* Speaker toggle */}
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isSpeaker
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-white/10 text-slate-400 hover:bg-white/20'
              }`}
              title="Speakerphone"
            >
              {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Video toggle */}
            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isVideoEnabled
                  ? 'bg-white text-slate-900 hover:bg-slate-200'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Camera"
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Mic toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Mute"
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* End Call button */}
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform"
              title="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
