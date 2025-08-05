import { Message } from '../types';

const STORAGE_KEYS = {
  MESSAGES: 'geo-chat-messages',
  DIRECT_MESSAGES: 'geo-chat-direct-messages',
  USER_PREFERENCES: 'geo-chat-preferences'
};

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  lastUsername?: string;
}

class StorageService {
  // Message persistence
  saveMessages(messages: Message[]): void {
    try {
      const serializedMessages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }));
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(serializedMessages));
    } catch (error) {
      console.warn('Failed to save messages to localStorage:', error);
    }
  }

  loadMessages(): Message[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.warn('Failed to load messages from localStorage:', error);
      return [];
    }
  }

  saveDirectMessages(messages: Message[]): void {
    try {
      const serializedMessages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }));
      localStorage.setItem(STORAGE_KEYS.DIRECT_MESSAGES, JSON.stringify(serializedMessages));
    } catch (error) {
      console.warn('Failed to save direct messages to localStorage:', error);
    }
  }

  loadDirectMessages(): Message[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DIRECT_MESSAGES);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.warn('Failed to load direct messages from localStorage:', error);
      return [];
    }
  }

  // User preferences
  saveUserPreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }

  loadUserPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (!stored) {
        return this.getDefaultPreferences();
      }
      
      const parsed = JSON.parse(stored);
      return { ...this.getDefaultPreferences(), ...parsed };
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      soundEnabled: true,
      notificationsEnabled: true
    };
  }

  // Clear data
  clearMessages(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.MESSAGES);
      localStorage.removeItem(STORAGE_KEYS.DIRECT_MESSAGES);
    } catch (error) {
      console.warn('Failed to clear messages:', error);
    }
  }

  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear all data:', error);
    }
  }

  // Get storage usage
  getStorageInfo() {
    try {
      const messages = localStorage.getItem(STORAGE_KEYS.MESSAGES) || '';
      const directMessages = localStorage.getItem(STORAGE_KEYS.DIRECT_MESSAGES) || '';
      const preferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) || '';
      
      const totalSize = messages.length + directMessages.length + preferences.length;
      const messageCount = this.loadMessages().length;
      const directMessageCount = this.loadDirectMessages().length;
      
      return {
        totalSize,
        messageCount,
        directMessageCount,
        formattedSize: this.formatBytes(totalSize)
      };
    } catch (error) {
      console.warn('Failed to get storage info:', error);
      return {
        totalSize: 0,
        messageCount: 0,
        directMessageCount: 0,
        formattedSize: '0 B'
      };
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const storageService = new StorageService();
