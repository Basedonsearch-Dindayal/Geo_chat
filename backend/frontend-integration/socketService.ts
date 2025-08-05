import { io, Socket } from 'socket.io-client';
import { 
  User, 
  Message, 
  DistanceRange,
  ClientToServerEvents,
  ServerToClientEvents 
} from './types';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: SocketType | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(private serverUrl: string = 'http://localhost:3001') {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, {
          transports: ['websocket', 'polling'],
          autoConnect: true,
        });

        this.socket.on('connect', () => {
          console.log('Connected to server');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from server:', reason);
        });

        // Set up event forwarding to listeners
        this.setupEventForwarding();
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupEventForwarding(): void {
    if (!this.socket) return;

    this.socket.on('user_joined', (user: User) => {
      this.emit('user_joined', user);
    });

    this.socket.on('user_left', (userId: string) => {
      this.emit('user_left', userId);
    });

    this.socket.on('user_updated', (user: User) => {
      this.emit('user_updated', user);
    });

    this.socket.on('new_message', (message: Message) => {
      this.emit('new_message', message);
    });

    this.socket.on('users_in_range', (users: User[]) => {
      this.emit('users_in_range', users);
    });

    this.socket.on('messages_in_range', (messages: Message[]) => {
      this.emit('messages_in_range', messages);
    });

    this.socket.on('direct_chat_started', (chatId: string, otherUser: User) => {
      this.emit('direct_chat_started', { chatId, otherUser });
    });

    this.socket.on('error', (error: { message: string; code?: string }) => {
      this.emit('error', error);
    });
  }

  // Event listener management
  on<T = any>(event: string, callback: (data: T) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return;
    
    if (callback) {
      const listeners = this.listeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emit<T = any>(event: string, data: T): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Chat operations
  joinLocation(username: string, latitude: number, longitude: number): void {
    if (!this.socket) throw new Error('Not connected to server');
    this.socket.emit('join_location', { username, latitude, longitude });
  }

  updateLocation(latitude: number, longitude: number): void {
    if (!this.socket) throw new Error('Not connected to server');
    this.socket.emit('update_location', { latitude, longitude });
  }

  sendMessage(content: string, latitude: number, longitude: number, recipientId?: string): void {
    if (!this.socket) throw new Error('Not connected to server');
    this.socket.emit('send_message', { content, latitude, longitude, recipientId });
  }

  startDirectChat(userId: string): void {
    if (!this.socket) throw new Error('Not connected to server');
    this.socket.emit('start_direct_chat', { userId });
  }

  setDistanceRange(range: DistanceRange): void {
    if (!this.socket) throw new Error('Not connected to server');
    this.socket.emit('set_distance_range', range);
  }

  getUsersInRange(range: DistanceRange): void {
    if (!this.socket) throw new Error('Not connected to server');
    this.socket.emit('get_users_in_range', range);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default SocketService;
