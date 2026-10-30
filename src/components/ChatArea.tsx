import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  ShieldCheck,
  Smile,
  Paperclip,
  Mic,
  Send,
  CheckCheck,
  Check,
  Lock,
  Clock,
  Play,
  Pause,
  MapPin,
  Trash2,
  X,
  Reply,
  Star,
  Eye,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { WALLPAPER_URL } from '../data/mockData';
import { Message } from '../types/chat';

export const ChatArea: React.FC = () => {
  const {
    activeChat,
    messages = [],
    currentUser,
    sendMessage,
    addReaction,
    deleteMessage,
    toggleStarMessage,
    setSafetyNumberChat,
    setShowGroupInfo,
    startCall,
    inspectEncryptionMode,
    setInspectingMessage,
  } = useChat();

  const [inputVal, setInputVal] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [inChatSearch, setInChatSearch] = useState(false);
  const [inChatQuery, setInChatQuery] = useState('');
  const [activeMessageActionId, setActiveMessageActionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<any>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setVoiceDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setVoiceDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingTimerRef.current);
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [isRecordingVoice]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          UsChat End-to-End Encryption
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
          Select a chat to view secure messages. All messages are encrypted with AES-256-GCM.
        </p>
      </div>
    );
  }

  const handleSendText = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;
    const text = inputVal.trim();
    setInputVal('');
    const replyId = replyingTo?.id;
    setReplyingTo(null);
    setShowEmojiPicker(false);
    await sendMessage(text, 'text', undefined, undefined, replyId);
  };

  const handleSendVoiceNote = async () => {
    setIsRecordingVoice(false);
    const duration = Math.max(2, voiceDuration);
    const audioWaveform = [25, 45, 80, 50, 70, 90, 60, 40, 65, 85, 30, 20];
    await sendMessage(
      `Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`,
      'voice',
      {
        url: 'https://actions.google.com/sounds/v1/science_fiction/teleport.ogg',
        name: `Voice note (${duration}s)`,
        size: `${Math.round(duration * 12)} KB`,
        duration,
        audioWaveform,
      }
    );
    setVoiceDuration(0);
  };

  const handleSendSampleImage = async () => {
    setShowAttachMenu(false);
    await sendMessage(
      'Encrypted schematic screenshot shared',
      'image',
      {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        name: 'security_audit_spec.png',
        size: '1.4 MB',
      }
    );
  };

  const handleSendLocation = async () => {
    setShowAttachMenu(false);
    await sendMessage(
      'Shared secure location coordinate',
      'location',
      undefined,
      {
        latitude: 37.7749,
        longitude: -122.4194,
        addressName: 'UsChat Security Center · 100 Pine St, SF',
      }
    );
  };

  const handleSendDocument = async () => {
    setShowAttachMenu(false);
    await sendMessage(
      'UsChat_E2EE_Cryptographic_Whitepaper_v2.pdf',
      'file',
      {
        url: '#',
        name: 'UsChat_E2EE_Whitepaper_v2.pdf',
        size: '2.8 MB',
      }
    );
  };

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '🔒', '🚀'];

  const filteredMessages = messages.filter((m) => {
    if (!inChatSearch || !inChatQuery.trim()) return true;
    return m.plaintext.toLowerCase().includes(inChatQuery.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-20 shrink-0 shadow-xs">
        {/* Contact / Group Info */}
        <div
          onClick={() => setShowGroupInfo(true)}
          className="flex items-center gap-3 cursor-pointer group py-1"
        >
          <img
            src={activeChat.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={activeChat.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:opacity-90 shadow-xs"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {activeChat.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] truncate max-w-[180px] sm:max-w-xs font-medium">
                {activeChat.isGroup
                  ? `${activeChat.participants?.length || 0} participants · E2EE active`
                  : 'online · tap for info'}
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Safety Number Verification Badge */}
          <button
            onClick={() => setSafetyNumberChat(activeChat)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
            title="Verify 60-digit safety numbers"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>E2EE Verified</span>
          </button>

          {/* Audio Call */}
          <button
            onClick={() => startCall(activeChat, 'audio')}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Start Encrypted Audio Call"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => startCall(activeChat, 'video')}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Start Encrypted Video Call"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Search inside chat */}
          <button
            onClick={() => setInChatSearch(!inChatSearch)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Search in conversation"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Drawer trigger */}
          <button
            onClick={() => setShowGroupInfo(true)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Chat info & settings"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* In-chat search banner if active */}
      {inChatSearch && (
        <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 z-20 animate-fade-in shadow-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search in this chat..."
            value={inChatQuery}
            onChange={(e) => setInChatQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-400"
            autoFocus
          />
          <button
            onClick={() => {
              setInChatSearch(false);
              setInChatQuery('');
            }}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages Canvas with Wallpaper */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 relative z-10"
        style={{
          backgroundImage: `url(${WALLPAPER_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Subtle Overlay for readability */}
        <div className="absolute inset-0 bg-slate-100/90 dark:bg-slate-950/92 pointer-events-none -z-10" />

        {/* E2EE Banner Announcement at top */}
        <div className="flex justify-center my-2">
          <div
            onClick={() => setSafetyNumberChat(activeChat)}
            className="cursor-pointer max-w-md px-4 py-2 bg-amber-500/10 dark:bg-amber-400/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/20 flex items-center gap-2.5 text-center text-[11px] text-amber-800 dark:text-amber-300 transition-colors shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them. Tap to verify.
            </span>
          </div>
        </div>

        {/* Disappearing messages notice if active */}
        {activeChat.disappearingMessageDuration > 0 && (
          <div className="flex justify-center my-1">
            <div className="px-3 py-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-full flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
              <Clock className="w-3 h-3 text-emerald-500" />
              <span>
                Disappearing messages active ({Math.round(activeChat.disappearingMessageDuration / 86400)} days)
              </span>
            </div>
          </div>
        )}

        {/* Message items */}
        {filtered
