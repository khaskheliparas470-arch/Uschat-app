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
  Square,
  Sparkles,
} from 'lucide-react';
import { WALLPAPER_URL } from '../data/mockData';
import { Message } from '../types/chat';

export const ChatArea: React.FC = () => {
  const {
    activeChat,
    messages,
    currentUser,
    sendMessage,
    addReaction,
    deleteMessage,
    toggleStarMessage,
    setSafetyNumberChat,
    setShowGroupInfo,
    startCall,
    inspectEncryptionMode,
    setInspectEncryptionMode,
    setInspectingMessage,
  } = useChat();

  const [inputVal, setInputVal] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioSpeed, setAudioSpeed] = useState<1 | 1.5 | 2>(1);
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
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
        url: '/src/assets/images/group_avatar_core_1791827382195.jpg',
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
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
      {/* Top Header */}
      <div className="h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-20 shrink-0">
        {/* Contact / Group Info */}
        <div
          onClick={() => setShowGroupInfo(true)}
          className="flex items-center gap-3 cursor-pointer group py-1"
        >
          <img
            src={activeChat.avatar}
            alt={activeChat.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-750 group-hover:opacity-90"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {activeChat.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] truncate max-w-[200px] sm:max-w-xs">
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
            title="Verify 60-digit safety numbers"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden md:inline">E2EE Verified</span>
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
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 z-20 animate-fade-in">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search in this chat..."
            value={inChatQuery}
            onChange={(e) => setInChatQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => {
              setInChatSearch(false);
              setInChatQuery('');
            }}
            className="p-1 text-slate-400 hover:text-slate-700"
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
        {/* Subtle Dark/Light Overlay for readability */}
        <div className="absolute inset-0 bg-slate-100/90 dark:bg-slate-950/90 pointer-events-none -z-10" />

        {/* E2EE Banner Announcement at top */}
        <div className="flex justify-center my-2">
          <div
            onClick={() => setSafetyNumberChat(activeChat)}
            className="cursor-pointer max-w-md px-4 py-2 bg-amber-500/10 dark:bg-amber-400/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/20 flex items-center gap-2.5 text-center text-[11px] text-amber-800 dark:text-amber-300 transition-colors shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Messages and calls are end-to-end encrypted. No one outside of this chat, not even UsChat, can read or listen to them. Tap to verify.
            </span>
          </div>
        </div>

        {/* Disappearing messages notice if active */}
        {activeChat.disappearingMessageDuration > 0 && (
          <div className="flex justify-center my-1">
            <div className="px-3 py-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-full flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
              <Clock className="w-3 h-3 text-emerald-500" />
              <span>
                Disappearing messages active ({activeChat.disappearingMessageDuration / 86400} days)
              </span>
            </div>
          </div>
        )}

        {/* Message items */}
        {filteredMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isSystem = msg.type === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="px-3 py-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  {msg.plaintext}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
              onMouseEnter={() => setActiveMessageActionId(msg.id)}
              onMouseLeave={() => setActiveMessageActionId(null)}
            >
              {/* Message Bubble Container */}
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-2xs relative text-xs leading-relaxed transition-all ${
                  isMe
                    ? 'bg-emerald-600 dark:bg-[#005c4b] text-white rounded-br-xs'
                    : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/40 dark:border-transparent'
                }`}
              >
                {/* Group sender name if not me */}
                {!isMe && activeChat.isGroup && (
                  <p className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 mb-1">
                    {msg.senderName}
                  </p>
                )}

                {/* Quoted / Replying preview snippet */}
                {msg.replyTo && (
                  <div
                    className={`mb-2 p-2 rounded-lg text-[11px] border-l-3 ${
                      isMe
                        ? 'bg-black/15 border-white/60 text-white/90'
                        : 'bg-slate-100 dark:bg-slate-800 border-emerald-500 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-semibold text-[10px]">{msg.replyTo.senderName}</p>
                    <p className="truncate">{msg.replyTo.text}</p>
                  </div>
                )}

                {/* Content based on type */}
                {msg.type === 'text' && (
                  <p className="whitespace-pre-wrap break-words">{msg.plaintext}</p>
                )}

                {msg.type === 'image' && msg.fileData && (
                  <div className="space-y-1.5">
                    <img
                      src={msg.fileData.url}
                      alt="Encrypted attachment"
                      referrerPolicy="no-referrer"
                      className="rounded-xl max-h-60 object-cover w-full border border-black/10"
                    />
                    {msg.plaintext && <p className="pt-1">{msg.plaintext}</p>}
                  </div>
                )}

                {msg.type === 'voice' && msg.fileData && (
                  <div className="flex items-center gap-3 py-1 min-w-[200px]">
                    <button
                      onClick={() =>
                        setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)
                      }
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                        isMe
                          ? 'bg-white text-emerald-700'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      {/* Audio waveform mockup */}
                      <div className="flex items-center gap-1 h-6">
                        {(msg.fileData.audioWaveform || [30, 60, 90, 40, 80, 50, 70]).map(
                          (height, idx) => (
                            <div
                              key={idx}
                              className={`w-1 rounded-full transition-all ${
                                isMe ? 'bg-white/80' : 'bg-emerald-500'
                              } ${playingAudioId === msg.id ? 'animate-pulse' : ''}`}
                              style={{ height: `${height}%` }}
                            />
                          )
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] opacity-80">
                        <span>{msg.fileData.name}</span>
                        <span>{msg.fileData.size}</span>
                      </div>
                    </div>
                  </div>
                )}

                {msg.type === 'location' && msg.locationData && (
                  <div className="space-y-2">
                    <div className="p-3 bg-black/10 dark:bg-black/20 rounded-xl flex items-start gap-2.5">
                      <div className="p-2 rounded-full bg-rose-500 text-white shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs">{msg.locationData.addressName}</p>
                        <p className="text-[10px] opacity-75 font-mono">
                          {msg.locationData.latitude.toFixed(4)}, {msg.locationData.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    {msg.plaintext && <p>{msg.plaintext}</p>}
                  </div>
                )}

                {msg.type === 'file' && msg.fileData && (
                  <div className="flex items-center gap-3 p-2 bg-black/10 dark:bg-black/20 rounded-xl">
                    <div className="p-2 rounded-lg bg-emerald-700/30 text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-xs">{msg.fileData.name}</p>
                      <p className="text-[10px] opacity-75">{msg.fileData.size}</p>
                    </div>
                  </div>
                )}

                {/* Footer time & status indicators */}
                <div
                  className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${
                    isMe ? 'text-white/80' : 'text-slate-400'
                  }`}
                >
                  {msg.isStarred && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />}
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-300 dark:text-emerald-300" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </div>

                {/* Live Raw Ciphertext Inspector Snippet (if inspect mode active) */}
                {inspectEncryptionMode && (
                  <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                      <span>AES-GCM-256</span>
                      <button
                        onClick={() => setInspectingMessage(msg)}
                        className="underline hover:opacity-100 flex items-center gap-0.5"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </div>
                    <p className="font-mono text-[9px] truncate opacity-70">
                      CIPHER: {msg.encryptedPayload.ciphertext}
                    </p>
                  </div>
                )}
              </div>

              {/* Message Reactions */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex items-center gap-1 -mt-2 z-10 px-1">
                  {msg.reactions.map((r) => (
                    <button
                      key={r.emoji}
                      onClick={() => addReaction(msg.id, r.emoji)}
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-1 text-[11px] hover:scale-105 transition-transform"
                    >
                      <span>{r.emoji}</span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {r.userIds.length}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Floating Action Menu on hover */}
              {activeMessageActionId === msg.id && (
                <div
                  className={`absolute top-0 ${
                    isMe ? 'right-full mr-2' : 'left-full ml-2'
                  } bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-1 flex items-center gap-1 z-20 animate-fade-in`}
                >
                  {/* Quick Reactions */}
                  {['👍', '❤️', '😂', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(msg.id, emoji)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs transition-transform hover:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                  <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                    title="Reply"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleStarMessage(msg.id)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                    title="Star message"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setInspectingMessage(msg)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-emerald-600 dark:text-emerald-400"
                    title="Inspect Ciphertext"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMessage(msg.id, isMe)}
                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-rose-500"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Quote Banner if replying */}
      {replyingTo && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs animate-fade-in z-20">
          <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-2">
            <div>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                Replying to {replyingTo.senderName}
              </p>
              <p className="text-slate-500 dark:text-slate-400 truncate max-w-md">
                {replyingTo.plaintext}
              </p>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input & Action Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative z-20 shrink-0">
        {/* Emoji Selector Panel */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 z-30 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 grid grid-cols-5 gap-2 animate-fade-in">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setInputVal((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Attachment Drawer */}
        {showAttachMenu && (
          <div className="absolute bottom-16 left-12 z-30 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-1 animate-fade-in w-48 text-xs">
            <button
              onClick={handleSendSampleImage}
              className="w-full flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-left"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span>Photos & Videos</span>
            </button>
            <button
              onClick={handleSendDocument}
              className="w-full flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-left"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span>Encrypted Doc</span>
            </button>
            <button
              onClick={handleSendLocation}
              className="w-full flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-left"
            >
              <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Share Location</span>
            </button>
          </div>
        )}

        {/* Live Audio Recording Mode */}
        {isRecordingVoice ? (
          <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/20 px-4 py-2 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <div className="flex items-center gap-2 text-rose-600 font-mono text-xs font-semibold">
                <span>Recording Audio Note:</span>
                <span>
                  {Math.floor(voiceDuration / 60)}:
                  {(voiceDuration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRecordingVoice(false)}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"
                title="Cancel Recording"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleSendVoiceNote}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Note</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Message Input Bar */
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Emojis"
            >
              <Smile className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPicker(false);
              }}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Attach File"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              placeholder="Type an end-to-end encrypted message..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />

            {inputVal.trim() ? (
              <button
                type="submit"
                className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-transform active:scale-95"
                title="Send Encrypted Message"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-2.5 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                title="Record Voice Note"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
