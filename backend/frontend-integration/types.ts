// Copy this file to your frontend project's types directory
// This ensures type consistency between frontend and backend

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

// Socket.IO event types for frontend
export interface ServerToClientEvents {
  user_joined: (user: User) => void;
  user_left: (userId: string) => void;
  user_updated: (user: User) => void;
  new_message: (message: Message) => void;
  users_in_range: (users: User[]) => void;
  messages_in_range: (messages: Message[]) => void;
  direct_chat_started: (chatId: string, otherUser: User) => void;
  error: (error: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  join_location: (data: { username: string; latitude: number; longitude: number }) => void;
  update_location: (data: { latitude: number; longitude: number }) => void;
  send_message: (data: { content: string; latitude: number; longitude: number; recipientId?: string }) => void;
  start_direct_chat: (data: { userId: string }) => void;
  set_distance_range: (range: DistanceRange) => void;
  get_users_in_range: (range: DistanceRange) => void;
  disconnect: () => void;
}
