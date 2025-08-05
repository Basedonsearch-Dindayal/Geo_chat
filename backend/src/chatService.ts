import { DirectChat, DistanceRange, Message, User } from './types.js';
import { calculateDistance, generateId } from './utils.js';

export class ChatService {
  private users: Map<string, User> = new Map();
  private messages: Message[] = [];
  private directChats: Map<string, DirectChat> = new Map();

  constructor() {
    // Add some test messages for demonstration
    this.addTestMessages();
  }

  private addTestMessages(): void {
    // Add a few test messages to make the chat feel alive
    const testMessages: Omit<Message, 'id' | 'timestamp'>[] = [
      {
        userId: 'system',
        username: 'System',
        content: 'Welcome to Geo Chat! You can chat with people nearby.',
        latitude: 40.7128,
        longitude: -74.0060,
        isDirectMessage: false
      }
    ];

    testMessages.forEach(msg => {
      const message: Message = {
        ...msg,
        id: generateId(),
        timestamp: new Date(Date.now() - Math.random() * 3600000) // Random time in the last hour
      };
      this.messages.push(message);
    });
  }

  // User management
  addUser(user: User): void {
    this.users.set(user.id, user);
  }

  removeUser(userId: string): void {
    this.users.delete(userId);
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    const user = this.users.get(userId);
    if (!user) return null;

    const updatedUser = { ...user, ...updates, lastSeen: new Date() };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  getUser(userId: string): User | null {
    return this.users.get(userId) || null;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUsersByIds(userIds: string[]): User[] {
    return userIds.map(id => this.users.get(id)).filter(Boolean) as User[];
  }

  // Location-based filtering
  getUsersInRange(userId: string, range: DistanceRange): User[] {
    const user = this.users.get(userId);
    if (!user) return [];

    return Array.from(this.users.values()).filter(otherUser => {
      if (otherUser.id === userId) return false;
      
      const distance = calculateDistance(
        user.latitude,
        user.longitude,
        otherUser.latitude,
        otherUser.longitude
      );
      
      return distance <= range;
    });
  }

  getMessagesInRange(userId: string, range: DistanceRange): Message[] {
    const user = this.users.get(userId);
    if (!user) return [];

    return this.messages.filter(message => {
      if (message.isDirectMessage) return false;
      
      const distance = calculateDistance(
        user.latitude,
        user.longitude,
        message.latitude,
        message.longitude
      );
      
      return distance <= range;
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Message management
  addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };

    if (message.isDirectMessage && message.recipientId) {
      // Handle direct message
      this.addDirectMessage(newMessage);
    } else {
      // Handle public message
      this.messages.push(newMessage);
    }

    return newMessage;
  }

  // Direct chat management
  private addDirectMessage(message: Message): void {
    if (!message.recipientId) return;

    const chatId = this.getDirectChatId(message.userId, message.recipientId);
    let directChat = this.directChats.get(chatId);

    if (!directChat) {
      directChat = {
        id: chatId,
        participants: [message.userId, message.recipientId],
        messages: [],
        lastActivity: new Date(),
      };
      this.directChats.set(chatId, directChat);
    }

    directChat.messages.push(message);
    directChat.lastActivity = new Date();
  }

  getDirectChat(userId1: string, userId2: string): DirectChat | null {
    const chatId = this.getDirectChatId(userId1, userId2);
    return this.directChats.get(chatId) || null;
  }

  getDirectChatMessages(userId1: string, userId2: string): Message[] {
    const directChat = this.getDirectChat(userId1, userId2);
    return directChat ? directChat.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) : [];
  }

  private getDirectChatId(userId1: string, userId2: string): string {
    // Always use the same order to ensure consistent chat IDs
    return [userId1, userId2].sort().join('-');
  }

  // Cleanup inactive users
  cleanupInactiveUsers(inactiveThresholdMs: number = 5 * 60 * 1000): string[] {
    const now = Date.now();
    const inactiveUsers: string[] = [];

    for (const [userId, user] of this.users.entries()) {
      if (!user.isOnline && (now - user.lastSeen.getTime()) > inactiveThresholdMs) {
        this.users.delete(userId);
        inactiveUsers.push(userId);
      }
    }

    return inactiveUsers;
  }

  // Get statistics
  getStats() {
    return {
      totalUsers: this.users.size,
      onlineUsers: Array.from(this.users.values()).filter(u => u.isOnline).length,
      totalMessages: this.messages.length,
      totalDirectChats: this.directChats.size,
    };
  }
}
