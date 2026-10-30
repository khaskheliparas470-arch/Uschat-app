
import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Phone,
  Lock,
} from 'lucide-react';

export const CallScreenModal: React.FC = () => {
  const {
    activeCall,
    endCall,
    localStream,
    remoteStream,
    incomingCall,
    acceptCall,
    rejectCall,
    allUsers,
  } = useChat();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeaker, setIsSpeaker] = useState(true);

  const incomingUser = incomingCall
    ? allUsers.find((user) => user.id === incomingCall.from)
    : null;

  useEffect(() => {
    if (!activeCall) {
      setDuration(0);
      return;
    }

    const timer = window.setInterval(() => {
      setDuration((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeCall]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }

    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream, activeCall]);

  useEffect(() => {
    if (!localStream) return;

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !isMuted;
    });
  }, [isMuted, localStream]);

  useEffect(() => {
    if (!localStream) return;

    localStream.getVideoTracks().forEach((track) => {
      track.enabled = isVideoEnabled;
    });
  }, [isVideoEnabled, localStream]);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !isSpeaker;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isSpeaker;
    }
  }, [isSpeaker, remoteStream]);

  const formattedTime = `${Math.floor(duration / 60)}:${String(
    duration % 60
  ).padStart(2, '0')}`;

  // Incoming call screen
  if (incomingCall && !activeCall) {
    const callerName =
      incomingCall.fromName || incomingUser?.name || 'Unknown caller';

    const callerAvatar = incomingUser?.avatar;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-sm rounded-3xl bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mb-4 flex justify-center items-center gap-2 text-emerald-400">
            <Lock size={16} />
            <span className="text-sm">UsChat Incoming Call</span>
          </div>

          {callerAvatar ? (
            <img
              src={callerAvatar}
              alt={callerName}
              className="mx-auto mb-5 h-28 w-28 rounded-full object-cover"
            />
          ) : (
            <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-slate-700 text-4xl">
              {callerName.charAt(0).toUpperCase()}
            </div>
          )}

          <h2 className="text-2xl font-bold">{callerName}</h2>

          <p className="mt-2 text-slate-400">
            Incoming {incomingCall.callType} call...
          </p>

          <div className="mt-10 flex justify-center gap-10">
            <button
              onClick={rejectCall}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 hover:bg-rose-700"
              title="Reject call"
            >
              <PhoneOff size={26} />
            </button>

            <button
              onClick={acceptCall}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700"
              title="Accept call"
            >
              <Phone size={26} />
            </button>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Check the caller before accepting.
          </p>
        </div>
      </div>
    );
  }

  if (!activeCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-3 text-white">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-slate-900">

        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <Lock size={14} />
            <span className="text-xs">UsChat Call</span>
          </div>

          <h2 className="mt-2 text-xl font-bold">
            {activeCall.name}
          </h2>

          <p className="text-sm text-emerald-400">
            {remoteStream ? 'Connected' : 'Connecting...'} · {formattedTime}
          </p>
        </div>

        <div className="relative flex-1 overflow-hidden bg-black">

          {activeCall.type === 'video' && (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />

              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute right-4 top-4 h-36 w-28 rounded-xl border border-white object-cover"
              />

              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  Waiting for the other person...
                </div>
              )}
            </>
          )}

          {activeCall.type === 'audio' && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <img
                src={activeCall.avatar}
                alt={activeCall.name}
                className="h-28 w-28 rounded-full object-cover"
              />

              <p className="text-slate-300">
                {remoteStream ? 'Audio connected' : 'Waiting for connection...'}
              </p>

              <audio
                ref={remoteAudioRef}
                autoPlay
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 p-6">

          <button
            onClick={() => setIsSpeaker((value) => !value)}
            className="rounded-full bg-slate-700 p-4 hover:bg-slate-600"
            title="Speaker"
          >
            {isSpeaker ? <Volume2 /> : <VolumeX />}
          </button>

          {activeCall.type === 'video' && (
            <button
              onClick={() => setIsVideoEnabled((value) => !value)}
              className="rounded-full bg-slate-700 p-4 hover:bg-slate-600"
              title="Camera"
            >
              {isVideoEnabled ? <Video /> : <VideoOff />}
            </button>
          )}

          <button
            onClick={() => setIsMuted((value) => !value)}
            className="rounded-full bg-slate-700 p-4 hover:bg-slate-600"
            title="Microphone"
          >
            {isMuted ? <MicOff /> : <Mic />}
          </button>

          <button
            onClick={endCall}
            className="rounded-full bg-rose-600 p-4 hover:bg-rose-700"
            title="End call"
          >
            <PhoneOff />
          </button>
        </div>
      </div>
    </div>
  );
};
