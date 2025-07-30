export interface User {
  id: string;
  username: string;
  latitude: number;
  longitude: number;
  lastSeen: Date;
  isOnline: boolean;
}

export interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  recipientId?: string; // For direct messages
  isDirectMessage?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  users: User[];
  messages: Message[];
}

export type DistanceRange = 1 | 5 | 10;

export interface DirectChat {
  id: string;
  participants: [string, string]; // User IDs
  messages: Message[];
  lastActivity: Date;
}