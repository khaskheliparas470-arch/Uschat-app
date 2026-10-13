import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, Chat, Message, StatusStory, CallLog, GroupParticipant } from '../types/chat';
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
  
  // Encrypted messaging
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
  
  // Groups
  createGroup: (name: string, description: string, participantIds: string[], avatarUrl?: string) => Promise<string>;
  updateGroupParticipants: (chatId: string, action: 'add' | 'remove' | 'promote' | 'demote', userId: string) => Promise<void>;
  updateGroupInfo: (chatId: string, updates: Partial<Chat>) => void;
  updateDisappearingMessages: (chatId: string, seconds: number) => void;
  
  // Inspect & Verify
  inspectEncryptionMode: boolean;
  setInspectEncryptionMode: (val: boolean) => void;
  inspectingMessage: Message | null;
  setInspectingMessage: (msg: Message | null) => void;
  safetyNumberChat: Chat | null;
  setSafetyNumberChat: (chat: Chat | null) => void;
  
  // Modals & Panels
  showGroupInfo: boolean;
  setShowGroupInfo: (val: boolean) => void;
  showNewChatModal: boolean;
  setShowNewChatModal: (val: boolean) => void;
  showNewGroupModal: boolean;
  setShowNewGroupModal: (val: boolean) => void;
  
  // Calls
  activeCall: ActiveCallData | null;
  startCall: (chat: Chat, type: 'audio' | 'video') => void;
  endCall: () => void;
  callLogs: CallLog[];
  
  // Status / Stories
  statusStories: StatusStory[];
  postStatusStory: (type: 'text' | 'image', content: string, caption?: string, bgColor?: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'uschat_data_v1';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
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

  // User state
  const [currentUserId, setCurrentUserId] = useState<string>('user_alice');
  const allUsers = INITIAL_USERS;
  const currentUser = useMemo(
    () => allUsers.find((u) => u.id === currentUserId) || allUsers[0],
    [currentUserId]
  );

  const switchCurrentUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  // Nav state
  const [activeTab, setActiveTab] = useState<'chats' | 'status' | 'calls'>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>('chat_group_security');

  // Chats & Messages
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_chats`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_CHATS;
  });

  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_messages`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_MESSAGES;
  });

  // Call Logs & Stories
  const [callLogs, setCallLogs] = useState<CallLog[]>(INITIAL_CALLS);
  const [statusStories, setStatusStories] = useState<StatusStory[]>(INITIAL_STATUS_STORIES);

  // Inspection & Modals
  const [inspectEncryptionMode, setInspectEncryptionMode] = useState<boolean>(false);
  const [inspectingMessage, setInspectingMessage] = useState<Message | null>(null);
  const [safetyNumberChat, setSafetyNumberChat] = useState<Chat | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState<boolean>(false);
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState<boolean>(false);
  const [activeCall, setActiveCall] = useState<ActiveCallData | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_chats`, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_messages`, JSON.stringify(messagesMap));
  }, [messagesMap]);

  // Cross-tab broadcast channel
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
    return () => {
      channel.close();
    };
  }, []);

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId) || null,
    [chats, activeChatId]
  );

  const currentMessages = useMemo(
    () => (activeChatId ? messagesMap[activeChatId] || [] : []),
    [activeChatId, messagesMap]
  );

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

      // Encrypt with chat symmetric key
      const encryptedPayload = await encryptMessage(plaintext, activeChat.symmetricKey);

      let replyToInfo;
      if (replyToId) {
        const target = (messagesMap[activeChatId] || []).find((m) => m.id === replyToId);
        if (target) {
          replyToInfo = {
            id: target.id,
            senderName: target.senderName,
            text: target.plaintext,
            type: target.type,
          };
        }
      }

      const isDisappearing = activeChat.disappearingMessageDuration > 0;
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

      // Optimistic update
      setMessagesMap((prev) => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), newMsg],
      }));

      // Update chat last message & reorder
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId) {
            return {
              ...c,
              lastMessage: newMsg,
            };
          }
          return c;
        })
      );

      // Broadcast to other tabs
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('uschat_sync_channel');
        channel.postMessage({ type: 'NEW_MESSAGE', chatId: activeChatId, message: newMsg });
        channel.close();
      }

      // Simulate network delivery states
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

      // Automated interactive peer response in 1-on-1 chats for live feel
      if (!activeChat.isGroup && activeChat.otherUserId && activeChat.otherUserId !== currentUser.id) {
        const peer = allUsers.find((u) => u.id === activeChat.otherUserId);
        if (peer) {
          // Set typing indicator
          setTimeout(() => {
            setChats((prev) =>
              prev.map((c) =>
                c.id === activeChatId ? { ...c, typingUsers: [peer.name] } : c
              )
            );
          }, 1500);

          setTimeout(async () => {
            // Remove typing indicator
            setChats((prev) =>
              prev.map((c) =>
                c.id === activeChatId ? { ...c, typingUsers: [] } : c
              )
            );

            // Construct contextual reply
            const replies = [
              `Received and decrypted via AES-256-GCM. Everything matches the security fingerprint! 🔒`,
              `Looks solid. Checked the safety number authentication block and it is fully verified.`,
              `Got it! The forward secrecy ratchet ensures this conversation stays private. 👍`,
              `Thanks for sharing. I'll test the group ratchet next.`,
            ];
            const peerText = replies[Math.floor(Math.random() * replies.length)];
            const peerEncrypted = await encryptMessage(peerText, activeChat.symmetricKey);

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
              [activeChatId]: [...(prev[activeChatId] || []), peerMsg],
            }));

            setChats((prev) =>
              prev.map((c) =>
                c.id === activeChatId ? { ...c, lastMessage: peerMsg } : c
              )
            );
          }, 3200);
        }
      }
    },
    [activeChatId, activeChat, currentUser, messagesMap, allUsers]
  );

  // Add emoji reaction
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
            // Toggle off
            updatedReactions = m.reactions
              .map((r) =>
                r.emoji === emoji
                  ? { ...r, userIds: r.userIds.filter((id) => id !== currentUser.id) }
                  : r
              )
              .filter((r) => r.userIds.length > 0);
          } else {
            // Add user
            updatedReactions = m.reactions.map((r) =>
              r.emoji === emoji ? { ...r, userIds: [...r.userIds, currentUser.id] } : r
            );
          }
        } else {
          updatedReactions = [...m.reactions, { emoji, userIds: [currentUser.id] }];
        }
        return { ...m, reactions: updatedReactions };
      }),
    }));
  };

  // Delete message
  const deleteMessage = (messageId: string, forEveryone: boolean) => {
    if (!activeChatId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map((m) => {
        if (m.id !== messageId) return m;
        if (forEveryone) {
          return {
            ...m,
            plaintext: '🚫 This message was deleted',
            isDeletedForEveryone: true,
          };
        }
        return m;
      }).filter((m) => (forEveryone ? true : m.id !== messageId)),
    }));
  };

  // Toggle star
  const toggleStarMessage = (messageId: string) => {
    if (!activeChatId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map((m) =>
        m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
      ),
    }));
  };

  // Create new group
  const createGroup = async (
    name: string,
    description: string,
    participantIds: string[],
    avatarUrl?: string
  ): Promise<string> => {
    const { rawKey } = await generateSymmetricKey();
    const newChatId = `chat_group_${Date.now()}`;

    const participants: GroupParticipant[] = [
      { userId: currentUser.id, role: 'admin', joinedAt: Date.now() },
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

    const sysText = `🔒 ${currentUser.name} created group "${name}" with end-to-end encryption. Group key initialized.`;
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

  // Update group participants & ratchet key
  const updateGroupParticipants = async (
    chatId: string,
    action: 'add' | 'remove' | 'promote' | 'demote',
    targetUserId: string
  ) => {
    // Re-generate / ratchet symmetric key for forward secrecy
    const { rawKey: ratchetedKey } = await generateSymmetricKey();
    const targetUser = allUsers.find((u) => u.id === targetUserId);

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
          newParticipants = newParticipants.filter((p) => p.userId !== targetUserId);
        } else if (action === 'promote') {
          newParticipants = newParticipants.map((p) =>
            p.userId === targetUserId ? { ...p, role: 'admin' as const } : p
          );
        } else if (action === 'demote') {
          newParticipants = newParticipants.map((p) =>
            p.userId === targetUserId ? { ...p, role: 'member' as const } : p
          );
        }
        return {
          ...c,
          participants: newParticipants,
          symmetricKey: ratchetedKey,
        };
      })
    );

    // Add security audit message in the group
    let auditText = '';
    if (action === 'add') auditText = `🔒 ${targetUser?.name || 'A user'} was added. Group encryption key ratcheted.`;
    if (action === 'remove') auditText = `🔒 ${targetUser?.name || 'A user'} was removed. Group key rotated to preserve forward secrecy.`;
    if (action === 'promote') auditText = `⭐ ${targetUser?.name || 'A user'} is now an admin.`;
    if (action === 'demote') auditText = `ℹ️ ${targetUser?.name || 'A user'} is no longer an admin.`;

    const encrypted = await encryptMessage(auditText, ratchetedKey);
    const auditMsg: Message = {
      id: `msg_sys_${Date.now()}`,
      chatId,
      senderId: 'system',
      senderName: 'UsChat Security',
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

  const updateGroupInfo = (chatId: string, updates: Partial<Chat>) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, ...updates } : c))
    );
  };

  const updateDisappearingMessages = (chatId: string, seconds: number) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, disappearingMessageDuration: seconds } : c
      )
    );
  };

  // Calls
  const startCall = (chat: Chat, type: 'audio' | 'video') => {
    setActiveCall({
      chatId: chat.id,
      name: chat.name,
      avatar: chat.avatar,
      type,
      isGroup: chat.isGroup,
      startTime: Date.now(),
    });
  };

  const endCall = () => {
    if (activeCall) {
      const durationSec = Math.max(1, Math.floor((Date.now() - activeCall.startTime) / 1000));
      const mins = Math.floor(durationSec / 60);
      const secs = durationSec % 60;
      const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;

      const newLog: CallLog = {
        id: `call_${Date.now()}`,
        contactId: activeCall.chatId,
        contactName: activeCall.name,
        contactAvatar: activeCall.avatar,
        type: activeCall.type,
        direction: 'outgoing',
        timestamp: Date.now(),
        duration: formatted,
        isEncrypted: true,
      };
      setCallLogs((prev) => [newLog, ...prev]);
    }
    setActiveCall(null);
  };

  // Status Story post
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
