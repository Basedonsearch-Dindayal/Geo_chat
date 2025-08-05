import { useCallback, useEffect, useState } from 'react';
import SocketService from '../services/socketService';
import { DistanceRange, Message, User } from '../types';

const socketService = new SocketService('http://localhost:3001');

export const useLocationChat = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersInRange, setUsersInRange] = useState<User[]>([]);
  const [messagesInRange, setMessagesInRange] = useState<Message[]>([]);
  const [directMessages, setDirectMessages] = useState<Message[]>([]);
  const [selectedRange, setSelectedRange] = useState<DistanceRange>(5);
  const [activeDirectChatUserId, setActiveDirectChatUserId] = useState<string>('');
  const [directChatUser, setDirectChatUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  // Function to show notification
  const showNotification = useCallback((message: Message, isDirectMessage: boolean) => {
    if (notificationPermission === 'granted' && 'Notification' in window) {
      const title = isDirectMessage 
        ? `Direct message from ${message.username}`
        : `New message from ${message.username}`;
      
      const notification = new Notification(title, {
        body: message.content,
        icon: '/favicon.ico', // You can add a custom icon
        tag: `message-${message.id}`, // Prevents duplicate notifications
      });

      // Auto-close notification after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }

    // Play notification sound (simple beep)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0u2UnBjaH0fPTgjMGHm7A7+OZUQ0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUwwLUKXh8bllHgg2jdXzzn0vBSF1xe/dlEILElyx5+2qWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnVoODlOq5O+zYBoGPJPY88p9KwUme8rx2o4+CRZiturqpVITC0ml4PK8aB4GM4nU8tGAMQYfcsLu45ZPDAxPpuTwsmEaBjuP2PPOfSsFJHfH8N2QQAoUXrTp66hVFApGn+D0u2UnBjaH0fPTgjMGHm7A7eSaUg0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUwwLUKXh8bllHgg2jdXzzn0vBSF1xe/dlEILElyx5+2qWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnVoODlOq5O+zYBoGPJPY88p9KwUme8rx2o4+CRZiturqpVITC0ml4PK8aB4GM4nU8tGAMQYfcsLu45ZPDAxPpuTwsmEaBjuP2PPOfSsFJHfH8N2QQAoUXrTp66hVFApGn+D0u2UnBjaH0fPTgjMGHm7A7eSaUg0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUwwLUKXh8bllHgg2jdXzzn0vBSF1xe/dlEILElyx5+2qWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnVoODlOq5O+zYBoGPJPY88p9KwUme8rx2o4+CRZiturqpVITC0ml4PK8aB4GM4nU8tGAMQYfcsLu45ZPDAxPpuTwsmEaBjuP2PPOfSsFJHfH8N2QQAoUXrTp66hVFApGn+D0u2UnBjaH0fPTgjMGHm7A7eSaUg0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUwwLUKXh8bllHgg=');
      audio.volume = 0.3; // Lower volume
      audio.play().catch(() => {
        // Ignore audio play errors (browser policy restrictions)
      });
    } catch (error) {
      // Ignore audio errors
    }
  }, [notificationPermission]);

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
    socketService.on<User>('user_initialized', (user) => {
      setCurrentUser(user);
    });

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
      // Parse timestamp if it's a string
      const parsedMessage = {
        ...message,
        timestamp: typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp
      };
      
      // Only show notification if it's not from the current user
      if (currentUser && parsedMessage.userId !== currentUser.id) {
        showNotification(parsedMessage, parsedMessage.isDirectMessage || false);
        setHasNewMessages(true); // Set indicator for new messages
      }
      
      if (parsedMessage.isDirectMessage) {
        // Handle direct message - add to direct messages (newest first)
        setDirectMessages(prev => [parsedMessage, ...prev]);
      } else {
        // Handle public message - add to public messages (newest first)
        setMessagesInRange(prev => [parsedMessage, ...prev]);
      }
    });

    socketService.on<User[]>('users_in_range', (users) => {
      setUsersInRange(users);
    });

    socketService.on<Message[]>('messages_in_range', (messages) => {
      // Parse timestamps for all messages and sort newest first
      const parsedMessages = messages
        .map(msg => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setMessagesInRange(parsedMessages);
    });

    socketService.on<{chatId: string, otherUser: User}>('direct_chat_started', ({ otherUser }) => {
      setDirectChatUser(otherUser);
      setActiveDirectChatUserId(otherUser.id);
    });

    socketService.on<{userId: string, username: string, recipientId?: string}>('user_typing', (data) => {
      if (currentUser && data.userId !== currentUser.id) {
        setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
      }
    });

    socketService.on<{userId: string, recipientId?: string}>('user_stopped_typing', (data) => {
      setTypingUsers(prev => prev.filter(id => id !== data.userId));
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

  // Clear new messages indicator
  const clearNewMessagesIndicator = useCallback(() => {
    setHasNewMessages(false);
  }, []);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!currentUser) return;
    socketService.startTyping(activeDirectChatUserId || undefined);
  }, [currentUser, activeDirectChatUserId]);

  const stopTyping = useCallback(() => {
    if (!currentUser) return;
    socketService.stopTyping(activeDirectChatUserId || undefined);
  }, [currentUser, activeDirectChatUserId]);

  // Get messages for current view (direct chat or public chat)
  const getCurrentMessages = useCallback(() => {
    if (activeDirectChatUserId && currentUser) {
      // Return direct messages for the current chat
      return directMessages.filter(msg => 
        (msg.userId === currentUser.id && msg.recipientId === activeDirectChatUserId) ||
        (msg.userId === activeDirectChatUserId && msg.recipientId === currentUser.id)
      );
    }
    // Return public messages
    return messagesInRange;
  }, [activeDirectChatUserId, currentUser, directMessages, messagesInRange]);

  return {
    // State
    currentUser,
    usersInRange,
    messagesInRange: getCurrentMessages(),
    selectedRange,
    activeDirectChatUserId,
    directChatUser,
    isConnected,
    error,
    hasNewMessages,
    typingUsers,

    // Actions
    initializeUser,
    updateLocation,
    sendMessage,
    startDirectChat,
    setSelectedRange: handleSetSelectedRange,
    clearError,
    clearNewMessagesIndicator,
    startTyping,
    stopTyping,

    // Socket service (for advanced usage)
    socketService
  };
};
