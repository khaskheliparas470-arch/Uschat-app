
import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatContext';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Volume2, VolumeX, Lock
} from 'lucide-react';

export const CallScreenModal: React.FC = () => {
  const {
    activeCall,
    endCall,
    localStream,
    remoteStream
  } = useChat();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    if (!activeCall) {
      setDuration(0);
      return;
    }

    const timer = setInterval(() => {
      setDuration(value => value + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCall]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream, activeCall]);

  useEffect(() => {
    if (!localStream) return;

    localStream.getAudioTracks().forEach(track => {
      track.enabled = !isMuted;
    });
  }, [isMuted, localStream]);

  useEffect(() => {
    if (!localStream) return;

    localStream.getVideoTracks().forEach(track => {
      track.enabled = isVideoEnabled;
    });
  }, [isVideoEnabled, localStream]);

  if (!activeCall) return null;

  const formattedTime =
    `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex items-center justify-center p-3">
      <div className="w-full max-w-3xl h-[85vh] rounded-3xl overflow-hidden bg-slate-900 flex flex-col">

        <div className="p-4 text-center">
          <div className="flex justify-center items-center gap-2 text-emerald-400">
            <Lock size={14} />
            <span className="text-xs">UsChat Call</span>
          </div>

          <h2 className="text-xl font-bold mt-2">
            {activeCall.name}
          </h2>

          <p className="text-emerald-400 text-sm">{formattedTime}</p>
        </div>

        <div className="relative flex-1 bg-black">
          {activeCall.type === 'video' && (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute top-4 right-4 w-28 h-40 rounded-xl object-cover border border-white"
              />
            </>
          )}

          {activeCall.type === 'audio' && (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <img
                src={activeCall.avatar}
                alt={activeCall.name}
                className="w-28 h-28 rounded-full object-cover"
              />
              <p className="text-slate-300">
                {remoteStream ? 'Connected' : 'Waiting for connection...'}
              </p>
              <audio
                ref={remoteVideoRef as React.RefObject<HTMLVideoElement>}
                autoPlay
              />
            </div>
          )}
        </div>

        <div className="p-6 flex justify-center gap-5 items-center">
          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className="p-4 rounded-full bg-slate-700"
            title="Speaker"
          >
            {isSpeaker ? <Volume2 /> : <VolumeX />}
          </button>

          <button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className="p-4 rounded-full bg-slate-700"
            title="Camera"
          >
            {isVideoEnabled ? <Video /> : <VideoOff />}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-4 rounded-full bg-slate-700"
            title="Microphone"
          >
            {isMuted ? <MicOff /> : <Mic />}
          </button>

          <button
            onClick={endCall}
            className="p-4 rounded-full bg-rose-600"
            title="End call"
          >
            <PhoneOff />
          </button>
        </div>
      </div>
    </div>
  );
};
