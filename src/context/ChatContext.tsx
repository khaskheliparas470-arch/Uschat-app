
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';

import {
  User,
  Chat,
  Message,
  StatusStory,
  CallLog,
  GroupParticipant,
} from '../types/chat';

import {
  INITIAL_USERS,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  INITIAL_STATUS_STORIES,
  INITIAL_CALLS,
} from '../data/mockData';

import {
  encryptMessage,
  generateSymmetricKey,
} from '../crypto/encryption';

interface ActiveCallData {
  chatId: string;
  name: string;
  avatar: string;
  type: 'audio' | 'video';
  isGroup: boolean;
  startTime: number;
}

interface IncomingCallData {
  from: string;
  fromName: string;
  offer: RTCSessionDescriptionInit;
  callType: 'audio' | 'video';
}

interface ChatContextType {
  currentUser: User;
  allUsers: User[];
  switchCurrentUser: (userId: string) => void;

  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | null;
  setActiveChatId: (id: string | null) => void;

  messages: Message[];
  activeTab: 'chats' | 'status' | 'calls';
  setActiveTab: (tab: 'chats' | 'status' | 'calls') => void;

  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  sendMessage: (
    plaintext: string,
    type?: Message['type'],
    fileData?: Message['fileData'],
    locationData?: Message['locationData'],
    replyToId?: string
  ) => Promise<void>;

  addReaction: (messageId: string, emoji: string) => void;
  deleteMessage: (messageId: string, forEveryone: boolean) => void;
  toggleStarMessage: (messageId: string) => void;

  createGroup: (
    name: string,
    description: string,
    participantIds: string[],
    avatarUrl?: string
  ) => Promise<string>;

  updateGroupParticipants: (
    chatId: string,
    action: 'add' | 'remove' | 'promote' | 'demote',
    userId: string
  ) => Promise<void>;

  updateGroupInfo: (chatId: string, updates: Partial<Chat>) => void;
  updateDisappearingMessages: (chatId: string, seconds: number) => void;

  inspectEncryptionMode: boolean;
  setInspectEncryptionMode: (val: boolean) => void;
  inspectingMessage: Message | null;
  setInspectingMessage: (msg: Message | null) => void;
  safetyNumberChat: Chat | null;
  setSafetyNumberChat: (chat: Chat | null) => void;

  showGroupInfo: boolean;
  setShowGroupInfo: (val: boolean) => void;
  showNewChatModal: boolean;
  setShowNewChatModal: (val: boolean) => void;
  showNewGroupModal: boolean;
  setShowNewGroupModal: (val: boolean) => void;

  activeCall: ActiveCallData | null;
  startCall: (chat: Chat, type: 'audio' | 'video') => Promise<void>;
  endCall: () => void;
  callLogs: CallLog[];
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  incomingCall: IncomingCallData | null;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;

  statusStories: StatusStory[];
  postStatusStory: (
    type: 'text' | 'image',
    content: string,
    caption?: string,
    bgColor?: string
  ) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'uschat_data_v1';

const SIGNALING_SERVER_URL =
  import.meta.env.VITE_SIGNALING_SERVER_URL || 'http://localhost:4000';

const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_theme`);
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_theme`, theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Users
  const [currentUserId, setCurrentUserId] = useState('user_alice');
  const allUsers = INITIAL_USERS;

  const currentUser = useMemo(
    () => allUsers.find((u) => u.id === currentUserId) || allUsers[0],
    [currentUserId, allUsers]
  );

  const switchCurrentUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  // Navigation
  const [activeTab, setActiveTab] = useState<
    'chats' | 'status' | 'calls'
  >('chats');

  const [activeChatId, setActiveChatId] = useState<string | null>(
    'chat_group_security'
  );

  // Chats
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_chats`);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CHATS;
      }
    }

    return INITIAL_CHATS;
  });

  // Messages
  const [messagesMap, setMessagesMap] = useState<
    Record<string, Message[]>
  >(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_messages`);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MESSAGES;
      }
    }

    return INITIAL_MESSAGES;
  });

  // Call logs and stories
  const [callLogs, setCallLogs] = useState<CallLog[]>(INITIAL_CALLS);
  const [statusStories, setStatusStories] = useState<StatusStory[]>(
    INITIAL_STATUS_STORIES
  );

  // Modals and inspection
  const [inspectEncryptionMode, setInspectEncryptionMode] =
    useState(false);

  const [inspectingMessage, setInspectingMessage] =
    useState<Message | null>(null);

  const [safetyNumberChat, setSafetyNumberChat] =
    useState<Chat | null>(null);

  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);

  // WebRTC state
  const [activeCall, setActiveCall] = useState<ActiveCallData | null>(
    null
  );

  const [localStream, setLocalStream] = useState<MediaStream | null>(
    null
  );

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(
    null
  );

  const [incomingCall, setIncomingCall] =
    useState<IncomingCallData | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const callPeerIdRef = useRef<string | null>(null);
  const incomingCallRef = useRef<IncomingCallData | null>(null);
  const activeCallRef = useRef<ActiveCallData | null>(null);

  const chatsRef = useRef(chats);
  const usersRef = useRef(allUsers);
  const currentUserRef = useRef(currentUser);

  chatsRef.current = chats;
  usersRef.current = allUsers;
  currentUserRef.current = currentUser;
  activeCallRef.current = activeCall;
  incomingCallRef.current = incomingCall;

  // Save chats and messages
  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}_chats`,
      JSON.stringify(chats)
    );
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}_messages`,
      JSON.stringify(messagesMap)
    );
  }, [messagesMap]);

  // Cross-tab message synchronization
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel('uschat_sync_channel');

    channel.onmessage = (event) => {
      if (event.data?.type === 'NEW_MESSAGE') {
        const { chatId, message } = event.data;

        setMessagesMap((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), message],
        }));
      } else if (event.data?.type === 'UPDATE_CHATS') {
        setChats(event.data.chats);
      }
    };

    return () => channel.close();
  }, []);

  // Current chat and messages
  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId) || null,
    [chats, activeChatId]
  );

  const currentMessages = useMemo(
    () => (activeChatId ? messagesMap[activeChatId] || [] : []),
    [activeChatId, messagesMap]
  );

  // WebRTC cleanup
  const cleanupCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);

    pendingIceCandidatesRef.current = [];
    callPeerIdRef.current = null;
    incomingCallRef.current = null;
    activeCallRef.current = null;
  }, []);

  // Create a WebRTC peer connection
  const createPeerConnection = useCallback((peerId: string) => {
    const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);

    peerConnectionRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          to: peerId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    peerConnection.ontrack = (event) => {
      let stream = event.streams[0];

      if (!stream) {
        stream = new MediaStream([event.track]);
      }

      setRemoteStream(stream);
    };

    peerConnection.onconnectionstatechange = () => {
      if (
        peerConnection.connectionState === 'failed' ||
        peerConnection.connectionState === 'closed'
      ) {
        setRemoteStream(null);
      }
    };

    return peerConnection;
  }, []);

  // Add queued ICE candidates
  const flushPendingIceCandidates = useCallback(async () => {
    const peerConnection = peerConnectionRef.current;

    if (!peerConnection?.remoteDescription) return;

    const candidates = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error('Could not add queued ICE candidate:', error);
      }
    }
  }, []);

  // Socket.IO connection
  useEffect(() => {
    const socket = io(SIGNALING_SERVER_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register-user', currentUserId);
      console.log('UsChat signalling connected:', socket.id);
    });

    socket.on('registered', (data) => {
      console.log('Registered calling user:', data.userId);
    });

    socket.on('incoming-call', (data: IncomingCallData) => {
      if (activeCallRef.current || incomingCallRef.current) {
        socket.emit('reject-call', { to: data.from });
        return;
      }

      incomingCallRef.current = data;
      setIncomingCall(data);
    });

    socket.on('call-answered', async (data) => {
      const peerConnection = peerConnectionRef.current;

      if (!peerConnection || !data.answer) return;

      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        await flushPendingIceCandidates();
      } catch (error) {
        console.error('Could not process call answer:', error);
      }
    });

    socket.on('ice-candidate', async (data) => {
      if (!data.candidate) return;

      const peerConnection = peerConnectionRef.current;

      if (!peerConnection || !peerConnection.remoteDescription) {
        pendingIceCandidatesRef.current.push(data.candidate);
        return;
      }

      try {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (error) {
        console.error('Could not add ICE candidate:', error);
      }
    });

    socket.on('call-unavailable', () => {
      alert('This user is currently unavailable.');
      cleanupCall();
    });

    socket.on('call-rejected', () => {
      alert('Your call was rejected.');
      cleanupCall();
    });

    socket.on('call-ended', () => {
      cleanupCall();
    });

    socket.on('connect_error', (error) => {
      console.error('Calling server connection error:', error.message);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      cleanupCall();
    };
  }, [currentUserId, cleanupCall, flushPendingIceCandidates]);

  // Send an encrypted message
  const sendMessage = useCallback(
    async (
      plaintext: string,
      type: Message['type'] = 'text',
      fileData?: Message['fileData'],
      locationData?: Message['locationData'],
      replyToId?: string
    ) => {
      if (!activeChatId || !activeChat) return;

      const encryptedPayload = await encryptMessage(
        plaintext,
        activeChat.symmetricKey
      );

      let replyToInfo;

      if (replyToId) {
        const target = (messagesMap[activeChatId] || []).find(
          (m) => m.id === replyToId
        );

        if (target) {
          replyToInfo = {
            id: target.id,
            senderName: target.senderName,
            text: target.plaintext,
            type: target.type,
          };
        }
      }

      const isDisappearing =
        activeChat.disappearingMessageDuration > 0;

      const expiresAt = isDisappearing
        ? Date.now() + activeChat.disappearingMessageDuration * 1000
        : undefined;

      const newMsg: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        chatId: activeChatId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        timestamp: Date.now(),
        plaintext,
        encryptedPayload,
        type,
        status: 'sending',
        replyTo: replyToInfo,
        reactions: [],
        fileData,
        locationData,
        isDisappearing,
        expiresAt,
      };

      setMessagesMap((prev) => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), newMsg],
      }));

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId ? { ...c, lastMessage: newMsg } : c
        )
      );

      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('uschat_sync_channel');

        channel.postMessage({
          type: 'NEW_MESSAGE',
          chatId: activeChatId,
          message: newMsg,
        });

        channel.close();
      }

      setTimeout(() => {
        setMessagesMap((prev) => ({
          ...prev,
          [activeChatId]: (prev[activeChatId] || []).map((m) =>
            m.id === newMsg.id ? { ...m, status: 'sent' } : m
          ),
        }));
      }, 300);

      setTimeout(() => {
        setMessagesMap((prev) => ({
          ...prev,
          [activeChatId]: (prev[activeChatId] || []).map((m) =>
            m.id === newMsg.id ? { ...m, status: 'delivered' } : m
          ),
        }));
      }, 700);

      setTimeout(() => {
        setMessagesMap((prev) => ({
          ...prev,
          [activeChatId]: (prev[activeChatId] || []).map((m) =>
            m.id === newMsg.id ? { ...m, status: 'read' } : m
          ),
        }));
      }, 1400);

      // Demo peer response (not a real remote message)
      if (
        !activeChat.isGroup &&
        activeChat.otherUserId &&
        activeChat.otherUserId !== currentUser.id
      ) {
        const peer = allUsers.find(
          (u) => u.id === activeChat.otherUserId
        );

        if (peer) {
          setTimeout(() => {
            setChats((prev) =>
              prev.map((c) =>
                c.id === activeChatId
                  ? { ...c, typingUsers: [peer.name] }
                  : c
              )
            );
          }, 1500);

          setTimeout(async () => {
            setChats((prev) =>
              prev.map((c) =>
                c.id === activeChatId ? { ...c, typingUsers: [] } : c
              )
            );

            const replies = [
              'Received your message! 👍',
              'Thanks for sharing!',
              'Got it. I will check it.',
              'That sounds good!',
            ];

            const peerText =
              replies[Math.floor(Math.random() * replies.length)];

            const peerEncrypted = await encryptMessage(
              peerText,
              activeChat.symmetricKey
            );

            const peerMsg: Message = {
              id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              chatId: activeChatId,
              senderId: peer.id,
              senderName: peer.name,
              timestamp: Date.now(),
              plaintext: peerText,
              encryptedPayload: peerEncrypted,
              type: 'text',
              status: 'read',
              reactions: [],
            };

            setMessagesMap((prev) => ({
              ...prev,
              [activeChatId]: [
                ...(prev[activeChatId] || []),
                peerMsg,
              ],
            }));

            setChats((prev) =>
              prev.map((c) =>
                c.id === activeChatId
                  ? { ...c, lastMessage: peerMsg }
                  : c
              )
            );
          }, 3200);
        }
      }
    },
    [activeChatId, activeChat, currentUser, messagesMap, allUsers]
  );

  // Reactions
  const addReaction = (messageId: string, emoji: string) => {
    if (!activeChatId) return;

    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map((m) => {
        if (m.id !== messageId) return m;

        const existing = m.reactions.find((r) => r.emoji === emoji);

        let updatedReactions;

        if (existing) {
          if (existing.userIds.includes(currentUser.id)) {
            updatedReactions = m.reactions
              .map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      userIds: r.userIds.filter(
                        (id) => id !== currentUser.id
                      ),
                    }
                  : r
              )
              .filter((r) => r.userIds.length > 0);
          } else {
            updatedReactions = m.reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, userIds: [...r.userIds, currentUser.id] }
                : r
            );
          }
        } else {
          updatedReactions = [
            ...m.reactions,
            { emoji, userIds: [currentUser.id] },
          ];
        }

        return { ...m, reactions: updatedReactions };
      }),
    }));
  };

  // Delete message
  const deleteMessage = (
    messageId: string,
    forEveryone: boolean
  ) => {
    if (!activeChatId) return;

    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || [])
        .map((m) => {
          if (m.id !== messageId) return m;

          if (forEveryone) {
            return {
              ...m,
              plaintext: '🚫 This message was deleted',
              isDeletedForEveryone: true,
            };
          }

          return m;
        })
        .filter((m) => (forEveryone ? true : m.id !== messageId)),
    }));
  };

  // Star message
  const toggleStarMessage = (messageId: string) => {
    if (!activeChatId) return;

    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map((m) =>
        m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
      ),
    }));
  };

  // Create group
  const createGroup = async (
    name: string,
    description: string,
    participantIds: string[],
    avatarUrl?: string
  ): Promise<string> => {
    const { rawKey } = await generateSymmetricKey();

    const newChatId = `chat_group_${Date.now()}`;

    const participants: GroupParticipant[] = [
      {
        userId: currentUser.id,
        role: 'admin',
        joinedAt: Date.now(),
      },
      ...participantIds.map((id) => ({
        userId: id,
        role: 'member' as const,
        joinedAt: Date.now(),
      })),
    ];

    const newGroupChat: Chat = {
      id: newChatId,
      isGroup: true,
      name,
      description,
      avatar:
        avatarUrl ||
        '/src/assets/images/group_avatar_core_1791827382195.jpg',
      participants,
      unreadCount: 0,
      disappearingMessageDuration: 0,
      symmetricKey: rawKey,
      createdBy: currentUser.id,
      createdAt: Date.now(),
    };

    const sysText = `🔒 ${currentUser.name} created group "${name}".`;

    const encryptedPayload = await encryptMessage(sysText, rawKey);

    const initialSysMessage: Message = {
      id: `msg_sys_${Date.now()}`,
      chatId: newChatId,
      senderId: 'system',
      senderName: 'UsChat Security',
      timestamp: Date.now(),
      plaintext: sysText,
      encryptedPayload,
      type: 'system',
      status: 'read',
      reactions: [],
    };

    newGroupChat.lastMessage = initialSysMessage;

    setChats((prev) => [newGroupChat, ...prev]);

    setMessagesMap((prev) => ({
      ...prev,
      [newChatId]: [initialSysMessage],
    }));

    setActiveChatId(newChatId);

    return newChatId;
  };

  // Update group participants
  const updateGroupParticipants = async (
    chatId: string,
    action: 'add' | 'remove' | 'promote' | 'demote',
    targetUserId: string
  ) => {
    const { rawKey: ratchetedKey } = await generateSymmetricKey();

    const targetUser = allUsers.find(
      (u) => u.id === targetUserId
    );

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;

        let newParticipants = [...c.participants];

        if (action === 'add') {
          if (!newParticipants.some((p) => p.userId === targetUserId)) {
            newParticipants.push({
              userId: targetUserId,
              role: 'member',
              joinedAt: Date.now(),
            });
          }
        } else if (action === 'remove') {
          newParticipants = newParticipants.filter(
            (p) => p.userId !== targetUserId
          );
        } else if (action === 'promote') {
          newParticipants = newParticipants.map((p) =>
            p.userId === targetUserId
              ? { ...p, role: 'admin' as const }
              : p
          );
        } else if (action === 'demote') {
          newParticipants = newParticipants.map((p) =>
            p.userId === targetUserId
              ? { ...p, role: 'member' as const }
              : p
          );
        }

        return {
          ...c,
          participants: newParticipants,
          symmetricKey: ratchetedKey,
        };
      })
    );

    let auditText = '';

    if (action === 'add') {
      auditText = `${targetUser?.name || 'A user'} was added to the group.`;
    }

    if (action === 'remove') {
      auditText = `${targetUser?.name || 'A user'} was removed from the group.`;
    }

    if (action === 'promote') {
      auditText = `${targetUser?.name || 'A user'} is now an admin.`;
    }

    if (action === 'demote') {
      auditText = `${targetUser?.name || 'A user'} is no longer an admin.`;
    }

    const encrypted = await encryptMessage(
      auditText,
      ratchetedKey
    );

    const auditMsg: Message = {
      id: `msg_sys_${Date.now()}`,
      chatId,
      senderId: 'system',
      senderName: 'UsChat',
      timestamp: Date.now(),
      plaintext: auditText,
      encryptedPayload: encrypted,
      type: 'system',
      status: 'read',
      reactions: [],
    };

    setMessagesMap((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), auditMsg],
    }));
  };

  const updateGroupInfo = (
    chatId: string,
    updates: Partial<Chat>
  ) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, ...updates } : c
      )
    );
  };

  const updateDisappearingMessages = (
    chatId: string,
    seconds: number
  ) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, disappearingMessageDuration: seconds }
          : c
      )
    );
  };

  // Start an outgoing audio/video call
  const startCall = async (
    chat: Chat,
    type: 'audio' | 'video'
  ) => {
    if (chat.isGroup) {
      alert('Group calling is not supported yet.');
      return;
    }

    if (!chat.otherUserId) {
      alert('This chat does not have a valid calling contact.');
      return;
    }

    if (!socketRef.current?.connected) {
      alert('Calling server is not connected. Please try again later.');
      return;
    }

    if (activeCallRef.current || incomingCallRef.current) {
      alert('You already have an active call.');
      return;
    }

    try {
      callPeerIdRef.current = chat.otherUserId;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      setActiveCall({
        chatId: chat.id,
        name: chat.name,
        avatar: chat.avatar,
        type,
        isGroup: false,
        startTime: Date.now(),
      });

      const peerConnection = createPeerConnection(chat.otherUserId);

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      socketRef.current.emit('call-user', {
        to: chat.otherUserId,
        offer,
        callType: type,
        fromName: currentUser.name,
      });
    } catch (error) {
      console.error('Could not start call:', error);
      alert(
        'Could not start the call. Check your camera/microphone permissions and try again.'
      );
      cleanupCall();
    }
  };

  // Accept an incoming call
  const acceptCall = async () => {
    const call = incomingCallRef.current;

    if (!call) return;

    try {
      callPeerIdRef.current = call.from;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: call.callType === 'video',
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      const matchingChat = chatsRef.current.find(
        (c) => !c.isGroup && c.otherUserId === call.from
      );

      const caller = usersRef.current.find(
        (u) => u.id === call.from
      );

      setActiveCall({
        chatId: matchingChat?.id || call.from,
        name: call.fromName || caller?.name || 'Unknown caller',
        avatar: matchingChat?.avatar || caller?.avatar || '',
        type: call.callType,
        isGroup: false,
        startTime: Date.now(),
      });

      setIncomingCall(null);
      incomingCallRef.current = null;

      const peerConnection = createPeerConnection(call.from);

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(call.offer)
      );

      await flushPendingIceCandidates();

      const answer = await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(answer);

      socketRef.current?.emit('answer-call', {
        to: call.from,
        answer,
      });
    } catch (error) {
      console.error('Could not accept call:', error);
      alert(
        'Could not accept the call. Check your camera/microphone permissions.'
      );

      socketRef.current?.emit('reject-call', {
        to: call.from,
      });

      cleanupCall();
    }
  };

  // Reject an incoming call
  const rejectCall = () => {
    const call = incomingCallRef.current;

    if (call) {
      socketRef.current?.emit('reject-call', {
        to: call.from,
      });
    }

    cleanupCall();
  };

  // End an active call
  const endCall = () => {
    const call = activeCallRef.current;
    const peerId = callPeerIdRef.current;

    if (peerId) {
      socketRef.current?.emit('end-call', {
        to: peerId,
      });
    }

    if (call) {
      const durationSec = Math.max(
        1,
        Math.floor((Date.now() - call.startTime) / 1000)
      );

      const mins = Math.floor(durationSec / 60);
      const secs = durationSec % 60;

      const newLog: CallLog = {
        id: `call_${Date.now()}`,
        contactId: call.chatId,
        contactName: call.name,
        contactAvatar: call.avatar,
        type: call.type,
        direction: 'outgoing',
        timestamp: Date.now(),
        duration: `${mins}:${secs.toString().padStart(2, '0')}`,
        isEncrypted: false,
      };

      setCallLogs((prev) => [newLog, ...prev]);
    }

    cleanupCall();
  };

  // Post a status story
  const postStatusStory = (
    type: 'text' | 'image',
    content: string,
    caption?: string,
    bgColor = '#075e54'
  ) => {
    const newStory: StatusStory = {
      id: `story_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      timestamp: Date.now(),
      type,
      content,
      caption,
      backgroundColor: bgColor,
      viewers: [],
    };

    setStatusStories((prev) => [newStory, ...prev]);
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        allUsers,
        switchCurrentUser,

        chats,
        activeChatId,
        activeChat,
        setActiveChatId,

        messages: currentMessages,
        activeTab,
        setActiveTab,

        theme,
        setTheme,
        toggleTheme,

        sendMessage,
        addReaction,
        deleteMessage,
        toggleStarMessage,

        createGroup,
        updateGroupParticipants,
        updateGroupInfo,
        updateDisappearingMessages,

        inspectEncryptionMode,
        setInspectEncryptionMode,
        inspectingMessage,
        setInspectingMessage,
        safetyNumberChat,
        setSafetyNumberChat,

        showGroupInfo,
        setShowGroupInfo,
        showNewChatModal,
        setShowNewChatModal,
        showNewGroupModal,
        setShowNewGroupModal,

        activeCall,
        startCall,
        endCall,
        callLogs,
        localStream,
        remoteStream,
        incomingCall,
        acceptCall,
        rejectCall,

        statusStories,
        postStatusStory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  return context;
};
