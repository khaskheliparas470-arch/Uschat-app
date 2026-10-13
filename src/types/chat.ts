import { EncryptedPayload } from '../crypto/encryption';

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  about: string;
  isOnline: boolean;
  lastSeen?: string;
  publicKeyFingerprint: string;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface MessageReplyInfo {
  id: string;
  senderName: string;
  text: string;
  type: 'text' | 'image' | 'voice' | 'file' | 'location' | 'system';
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  plaintext: string;
  encryptedPayload: EncryptedPayload;
  type: 'text' | 'image' | 'voice' | 'file' | 'location' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: MessageReplyInfo;
  reactions: Reaction[];
  fileData?: {
    url: string;
    name: string;
    size: string;
    duration?: number;
    audioWaveform?: number[];
  };
  locationData?: {
    latitude: number;
    longitude: number;
    addressName: string;
  };
  isStarred?: boolean;
  isDisappearing?: boolean;
  expiresAt?: number;
  isDeletedForEveryone?: boolean;
}

export interface GroupParticipant {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: number;
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name: string;
  avatar: string;
  description?: string;
  participants: GroupParticipant[];
  otherUserId?: string; // For 1-on-1 chats
  unreadCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  disappearingMessageDuration: number; // 0 = off, 86400 = 24h, 604800 = 7d, 7776000 = 90d
  symmetricKey: string; // Base64 key for this chat's E2E encryption
  createdBy?: string;
  createdAt: number;
  lastMessage?: Message;
  typingUsers?: string[];
}

export interface StatusStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: number;
  type: 'text' | 'image';
  content: string; // text or image url
  caption?: string;
  backgroundColor?: string;
  viewers: string[];
}

export interface CallLog {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  duration?: string;
  isEncrypted: boolean;
}
