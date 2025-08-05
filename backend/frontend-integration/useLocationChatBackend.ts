import { useState, useEffect, useCallback } from 'react';
import SocketService from './socketService';
import { User, Message, DistanceRange } from './types';

const socketService = new SocketService('http://localhost:3001');

export const useLocationChatBackend = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersInRange, setUsersInRange] = useState<User[]>([]);
  const [messagesInRange, setMessagesInRange] = useState<Message[]>([]);
  const [selectedRange, setSelectedRange] = useState<DistanceRange>(5);
  const [activeDirectChatUserId, setActiveDirectChatUserId] = useState<string>('');
  const [directChatUser, setDirectChatUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection and event listeners
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError('Failed to connect to server');
        console.error('Socket connection error:', err);
      }
    };

    initializeSocket();

    // Set up event listeners
    socketService.on<User>('user_joined', (user) => {
      setUsersInRange(prev => [...prev, user]);
    });

    socketService.on<string>('user_left', (userId) => {
      setUsersInRange(prev => prev.filter(u => u.id !== userId));
    });

    socketService.on<User>('user_updated', (user) => {
      setUsersInRange(prev => prev.map(u => u.id === user.id ? user : u));
    });

    socketService.on<Message>('new_message', (message) => {
      if (message.isDirectMessage) {
        // Handle direct message - you might want to manage this separately
        console.log('Direct message received:', message);
      } else {
        setMessagesInRange(prev => [...prev, message]);
      }
    });

    socketService.on<User[]>('users_in_range', (users) => {
      setUsersInRange(users);
    });

    socketService.on<Message[]>('messages_in_range', (messages) => {
      setMessagesInRange(messages);
    });

    socketService.on<{chatId: string, otherUser: User}>('direct_chat_started', ({ chatId, otherUser }) => {
      setDirectChatUser(otherUser);
      setActiveDirectChatUserId(otherUser.id);
    });

    socketService.on<{message: string}>('error', (error) => {
      setError(error.message);
      console.error('Socket error:', error);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Initialize user location and join chat
  const initializeUser = useCallback(async (position: GeolocationPosition, username: string) => {
    try {
      const user: User = {
        id: '', // Will be assigned by server
        username,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        lastSeen: new Date(),
        isOnline: true
      };

      setCurrentUser(user);
      
      // Join location-based chat
      socketService.joinLocation(username, position.coords.latitude, position.coords.longitude);
      
      // Get initial users and messages in range
      socketService.getUsersInRange(selectedRange);
    } catch (err) {
      setError('Failed to initialize user');
      console.error('Initialize user error:', err);
    }
  }, [selectedRange]);

  // Update user location
  const updateLocation = useCallback((position: GeolocationPosition) => {
    if (!currentUser) return;

    try {
      const updatedUser = {
        ...currentUser,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        lastSeen: new Date()
      };

      setCurrentUser(updatedUser);
      socketService.updateLocation(position.coords.latitude, position.coords.longitude);
    } catch (err) {
      setError('Failed to update location');
      console.error('Update location error:', err);
    }
  }, [currentUser]);

  // Send a message
  const sendMessage = useCallback((content: string) => {
    if (!currentUser) {
      setError('User not initialized');
      return;
    }

    try {
      socketService.sendMessage(
        content,
        currentUser.latitude,
        currentUser.longitude,
        activeDirectChatUserId || undefined
      );
    } catch (err) {
      setError('Failed to send message');
      console.error('Send message error:', err);
    }
  }, [currentUser, activeDirectChatUserId]);

  // Start direct chat
  const startDirectChat = useCallback((userId: string) => {
    if (userId === '') {
      setActiveDirectChatUserId('');
      setDirectChatUser(null);
      return;
    }

    try {
      setActiveDirectChatUserId(userId);
      socketService.startDirectChat(userId);
    } catch (err) {
      setError('Failed to start direct chat');
      console.error('Start direct chat error:', err);
    }
  }, []);

  // Change distance range
  const handleSetSelectedRange = useCallback((range: DistanceRange) => {
    setSelectedRange(range);
    try {
      socketService.setDistanceRange(range);
      socketService.getUsersInRange(range);
    } catch (err) {
      setError('Failed to update distance range');
      console.error('Set distance range error:', err);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    currentUser,
    usersInRange,
    messagesInRange,
    selectedRange,
    activeDirectChatUserId,
    directChatUser,
    isConnected,
    error,

    // Actions
    initializeUser,
    updateLocation,
    sendMessage,
    startDirectChat,
    setSelectedRange: handleSetSelectedRange,
    clearError,

    // Socket service (for advanced usage)
    socketService
  };
};
