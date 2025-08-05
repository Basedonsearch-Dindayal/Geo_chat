import { Server, Socket } from 'socket.io';
import { ChatService } from './chatService.js';
import {
    ClientToServerEvents,
    DistanceRange,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
    User
} from './types.js';
import { generateId, isValidCoordinates } from './utils.js';

export class SocketHandler {
  private chatService: ChatService;
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

  constructor(
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    chatService: ChatService
  ) {
    this.io = io;
    this.chatService = chatService;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join location-based chat
      socket.on('join_location', (data) => {
        this.handleJoinLocation(socket, data);
      });

      // Update user location
      socket.on('update_location', (data) => {
        this.handleUpdateLocation(socket, data);
      });

      // Send message
      socket.on('send_message', (data) => {
        this.handleSendMessage(socket, data);
      });

      // Start direct chat
      socket.on('start_direct_chat', (data) => {
        this.handleStartDirectChat(socket, data);
      });

      // Set distance range
      socket.on('set_distance_range', (range) => {
        this.handleSetDistanceRange(socket, range);
      });

      // Get users in range
      socket.on('get_users_in_range', (range) => {
        this.handleGetUsersInRange(socket, range);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });

    // Periodic cleanup of inactive users
    setInterval(() => {
      const inactiveUsers = this.chatService.cleanupInactiveUsers();
      if (inactiveUsers.length > 0) {
        inactiveUsers.forEach(userId => {
          this.io.emit('user_left', userId);
        });
      }
    }, 60000); // Check every minute
  }

  private handleJoinLocation(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    data: { username: string; latitude: number; longitude: number }
  ): void {
    try {
      // Validate input
      if (!data.username || data.username.trim().length < 2 || data.username.trim().length > 20) {
        socket.emit('error', { message: 'Username must be between 2 and 20 characters' });
        return;
      }

      if (!isValidCoordinates(data.latitude, data.longitude)) {
        socket.emit('error', { message: 'Invalid coordinates' });
        return;
      }

      // Create new user
      const user: User = {
        id: generateId(),
        username: data.username.trim(),
        latitude: data.latitude,
        longitude: data.longitude,
        lastSeen: new Date(),
        isOnline: true,
      };

      // Store user data in socket
      socket.data = {
        userId: user.id,
        username: user.username,
        latitude: data.latitude,
        longitude: data.longitude,
        distanceRange: 5, // Default range
      };

      // Add user to chat service
      this.chatService.addUser(user);

      // Send initial data to the newly joined user
      const usersInRange = this.chatService.getUsersInRange(user.id, socket.data.distanceRange);
      const messagesInRange = this.chatService.getMessagesInRange(user.id, socket.data.distanceRange);
      
      // Send the user data back to the client
      socket.emit('user_initialized', user);
      socket.emit('users_in_range', usersInRange);
      socket.emit('messages_in_range', messagesInRange);

      // Notify other users in range about the new user
      usersInRange.forEach(otherUser => {
        const otherSocket = this.findSocketByUserId(otherUser.id);
        if (otherSocket) {
          otherSocket.emit('user_joined', user);
        }
      });

      console.log(`User ${user.username} (${user.id}) joined at ${user.latitude}, ${user.longitude}`);
    } catch (error) {
      console.error('Error in join_location:', error);
      socket.emit('error', { message: 'Failed to join location chat' });
    }
  }

  private handleUpdateLocation(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    data: { latitude: number; longitude: number }
  ): void {
    try {
      if (!socket.data?.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      if (!isValidCoordinates(data.latitude, data.longitude)) {
        socket.emit('error', { message: 'Invalid coordinates' });
        return;
      }

      // Update user location
      const updatedUser = this.chatService.updateUser(socket.data.userId, {
        latitude: data.latitude,
        longitude: data.longitude,
      });

      if (updatedUser) {
        // Update socket data
        socket.data.latitude = data.latitude;
        socket.data.longitude = data.longitude;

        // Notify users in range about the update
        const usersInRange = this.chatService.getUsersInRange(socket.data.userId, 10);
        usersInRange.forEach(otherUser => {
          const otherSocket = this.findSocketByUserId(otherUser.id);
          if (otherSocket) {
            otherSocket.emit('user_updated', updatedUser);
          }
        });
      }
    } catch (error) {
      console.error('Error in update_location:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  }

  private handleSendMessage(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    data: { content: string; latitude: number; longitude: number; recipientId?: string }
  ): void {
    try {
      if (!socket.data?.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      if (!data.content || data.content.trim().length === 0 || data.content.length > 500) {
        socket.emit('error', { message: 'Message must be between 1 and 500 characters' });
        return;
      }

      if (!isValidCoordinates(data.latitude, data.longitude)) {
        socket.emit('error', { message: 'Invalid coordinates' });
        return;
      }

      const user = this.chatService.getUser(socket.data.userId);
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Create message
      const message = this.chatService.addMessage({
        userId: user.id,
        username: user.username,
        content: data.content.trim(),
        latitude: data.latitude,
        longitude: data.longitude,
        recipientId: data.recipientId,
        isDirectMessage: !!data.recipientId,
      });

      if (data.recipientId) {
        // Direct message - send to recipient only
        const recipientSocket = this.findSocketByUserId(data.recipientId);
        if (recipientSocket) {
          recipientSocket.emit('new_message', message);
        }
        // Also send back to sender for confirmation
        socket.emit('new_message', message);
      } else {
        // Public message - send to users in range
        const usersInRange = this.chatService.getUsersInRange(user.id, socket.data.distanceRange);
        usersInRange.forEach(otherUser => {
          const otherSocket = this.findSocketByUserId(otherUser.id);
          if (otherSocket) {
            otherSocket.emit('new_message', message);
          }
        });
        // Also send back to sender
        socket.emit('new_message', message);
      }

      console.log(`Message from ${user.username}: ${data.content}`);
    } catch (error) {
      console.error('Error in send_message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleStartDirectChat(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    data: { userId: string }
  ): void {
    try {
      if (!socket.data?.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      if (data.userId === socket.data.userId) {
        socket.emit('error', { message: 'Cannot start chat with yourself' });
        return;
      }

      const otherUser = this.chatService.getUser(data.userId);
      if (!otherUser) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Get or create direct chat
      const directChat = this.chatService.getDirectChat(socket.data.userId, data.userId);
      const chatId = directChat?.id || `${[socket.data.userId, data.userId].sort().join('-')}`;

      socket.emit('direct_chat_started', chatId, otherUser);
    } catch (error) {
      console.error('Error in start_direct_chat:', error);
      socket.emit('error', { message: 'Failed to start direct chat' });
    }
  }

  private handleSetDistanceRange(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    range: DistanceRange
  ): void {
    try {
      if (!socket.data?.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      if (![1, 5, 10].includes(range)) {
        socket.emit('error', { message: 'Invalid distance range' });
        return;
      }

      socket.data.distanceRange = range;

      // Send updated users and messages in new range
      this.handleGetUsersInRange(socket, range);
    } catch (error) {
      console.error('Error in set_distance_range:', error);
      socket.emit('error', { message: 'Failed to set distance range' });
    }
  }

  private handleGetUsersInRange(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    range: DistanceRange
  ): void {
    try {
      if (!socket.data?.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const usersInRange = this.chatService.getUsersInRange(socket.data.userId, range);
      const messagesInRange = this.chatService.getMessagesInRange(socket.data.userId, range);

      socket.emit('users_in_range', usersInRange);
      socket.emit('messages_in_range', messagesInRange);
    } catch (error) {
      console.error('Error in get_users_in_range:', error);
      socket.emit('error', { message: 'Failed to get users in range' });
    }
  }

  private handleDisconnect(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
  ): void {
    try {
      if (socket.data?.userId) {
        // Mark user as offline
        const updatedUser = this.chatService.updateUser(socket.data.userId, {
          isOnline: false,
        });

        if (updatedUser) {
          // Notify other users
          const usersInRange = this.chatService.getUsersInRange(socket.data.userId, 10);
          usersInRange.forEach(otherUser => {
            const otherSocket = this.findSocketByUserId(otherUser.id);
            if (otherSocket) {
              otherSocket.emit('user_updated', updatedUser);
            }
          });
        }

        console.log(`User ${socket.data.username} (${socket.data.userId}) disconnected`);
      }
    } catch (error) {
      console.error('Error in disconnect:', error);
    }
  }

  private findSocketByUserId(userId: string): Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null {
    for (const [, socket] of this.io.sockets.sockets) {
      if (socket.data?.userId === userId) {
        return socket;
      }
    }
    return null;
  }
}
