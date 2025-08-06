import { useCallback, useEffect, useState } from 'react';
import SocketService from '../services/socketService';
import { DistanceRange, Message, User } from '../types';

const socketService = new SocketService(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001');

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
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  // Enhanced sound notification function
  const playNotificationSound = useCallback((type: 'message' | 'directMessage' | 'userJoined' = 'message') => {
    try {
      // Different tones for different notification types
      const soundData = {
        message: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0u2UnBjaH0fPTgjMGHm7A7+OZUQ0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUwwLUKXh8bllHgg2jdXzzn0vBSF1xe/dlEILElyx5+2qWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnVoODlOq5O+zYBoGPJPY88p9KwUme8rx2o4+CRZiturqpVITC0ml4PK8aB4GM4nU8tGAMQYfcsLu45ZPDAxPpuTwsmEaBjuP2PPOfSsFJHfH8N2QQAoUXrTp66hVFApGn+D0u2UnBjaH0fPTgjMGHm7A7eSaUg0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUwwLUKXh8bllHgg=',
        directMessage: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0u2UnBjaH0fPTgjMGHm7A7+OZUQ0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUwwLUKXh8bllHgg2jdXzzn0vBSF1xe/dlEILElyx5+2qWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnVoODlOq5O+zYBoGPJPY88p9KwUme8rx2o4+CRZiturqpVITC0ml4PK8aB4GM4nU8tGAMQYfcsLu45ZPDAxPpuTwsmEaBjuP2PPOfSsFJHfH8N2QQAoUXrTp66hVFApGn+D0u2UnBjaH0fPTgjMGHm7A7eSaUg0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUwwLUKXh8bllHgg2jdXzzn0vBSF1xe/dlEILElyx5+2qWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnVoODlOq5O+zYBoGPJPY88p9KwUme8rx2o4+CRZiturqpVITC0ml4PK8aB4GM4nU8tGAMQYfcsLu45ZPDAxPpuTwsmEaBjuP2PPOfSsFJHfH8N2QQAoUXrTp66hVFApGn+D0u2UnBjaH0fPTgjMGHm7A7eSaUg0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUwwLUKXh8bllHgg=',
        userJoined: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0u2UnBjaH0fPTgjMGHm7A7+OZUQ0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUwwLUKXh8bllHgg2jdXzzn0vBSF1xe/dlEILElyx5+2qWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnVoODlOq5O+zYBoGPJPY88p9KwUme8rx2o4+CRZiturqpVITC0ml4PK8aB4GM4nU8tGAMQYfcsLu45ZPDAxPpuTwsmEaBjuP2PPOfSsFJHfH8N2QQAoUXrTp66hVFApGn+D0u2UnBjaH0fPTgjMGHm7A7eSaUg0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUwwLUKXh8bllHgg2jdXzzn0vBSF1xe/dlEILElyx5+2qWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnVoODlOq5O+zYBoGPJPY88p9KwUme8rx2o4+CRZiturqpVITC0ml4PK8aB4GM4nU8tGAMQYfcsLu45ZPDAxPpuTwsmEaBjuP2PPOfSsFJHfH8N2QQAoUXrTp66hVFApGn+D0u2UnBjaH0fPTgjMGHm7A7eSaUg0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUwwLUKXh8bllHgg='
      };

      const audio = new Audio(soundData[type]);
      audio.volume = type === 'directMessage' ? 0.5 : 0.3; // Higher volume for direct messages
      audio.play().catch(() => {
        // Ignore audio play errors (browser policy restrictions)
      });
    } catch (error) {
      // Ignore audio errors
    }
  }, []);

  // Function to show notification with message count
  const showNotification = useCallback((message: Message, isDirectMessage: boolean, messageCount: number) => {
    console.log('🔔 showNotification called:', { message, isDirectMessage, messageCount, notificationPermission });
    
    if (notificationPermission === 'granted' && 'Notification' in window) {
      const title = isDirectMessage 
        ? `Direct message from ${message.username} (${messageCount} unread)`
        : `New message from ${message.username}`;
      
      const body = messageCount > 1 
        ? `${message.content} (+${messageCount - 1} more messages)`
        : message.content;
      
      console.log('🚀 Creating notification:', { title, body });
      
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: `message-${message.userId}`, // Group by user to prevent spam
        badge: '/favicon.ico',
        requireInteraction: isDirectMessage, // Direct messages stay until clicked
      });

      console.log('✅ Notification created successfully');

      // Auto-close notification after 5 seconds for public messages
      if (!isDirectMessage) {
        setTimeout(() => notification.close(), 5000);
      }
    } else {
      console.log('❌ Cannot show notification:', { 
        hasNotificationAPI: 'Notification' in window,
        permission: notificationPermission 
      });
    }

    // Play appropriate notification sound
    playNotificationSound(isDirectMessage ? 'directMessage' : 'message');
  }, [notificationPermission, playNotificationSound]);

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
      console.log('👋 User joined:', user.username);
      setUsersInRange(prev => [...prev, user]);
      // Play subtle sound for user joining
      playNotificationSound('userJoined');
    });

    socketService.on<string>('user_left', (userId) => {
      console.log('👋 User left:', userId);
      setUsersInRange(prev => prev.filter(u => u.id !== userId));
    });

    socketService.on<User>('user_updated', (user) => {
      setUsersInRange(prev => prev.map(u => u.id === user.id ? user : u));
    });

    socketService.on<Message>('new_message', (message) => {
      console.log('🔄 Raw message received:', message);
      
      // Parse timestamp if it's a string
      const parsedMessage = {
        ...message,
        timestamp: typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp
      };
      
      console.log('✅ Parsed message:', parsedMessage);
      
      // Get current activeDirectChatUserId value
      setActiveDirectChatUserId(currentActiveChat => {
        console.log('📱 Current active direct chat user ID:', currentActiveChat);
        
        // Check current user and process notifications using state updater pattern
        setCurrentUser(currentUserState => {
          console.log('👤 Current user in message handler:', currentUserState);
          
          // Only show notification if it's not from the current user AND not from active chat user
          if (currentUserState && 
              parsedMessage.userId !== currentUserState.id && 
              parsedMessage.userId !== currentActiveChat) {
            console.log('🎯 Message is from different user and not in active chat, processing...');
            
            // Update unread count for this user and get the new count
            setUnreadCounts(prev => {
              console.log('📊 Previous unread counts:', prev);
              const currentCount = prev[parsedMessage.userId] || 0;
              const newUnreadCount = currentCount + 1;
              const newCounts = { ...prev, [parsedMessage.userId]: newUnreadCount };
              console.log(`📨 Message from ${parsedMessage.username}: ${currentCount} → ${newUnreadCount} unread messages`);
              console.log('📊 New unread counts:', newCounts);
              
              // Show notification with the correct count
              console.log(`🔔 Showing notification for ${parsedMessage.username} with count ${newUnreadCount}`);
              showNotification(parsedMessage, parsedMessage.isDirectMessage || false, newUnreadCount);
              
              return newCounts;
            });
            
            setHasNewMessages(true); // Set indicator for new messages
          } else {
            if (parsedMessage.userId === currentUserState?.id) {
              console.log('⏭️ Skipping notification - message from current user');
            } else if (parsedMessage.userId === currentActiveChat) {
              console.log('⏭️ Skipping notification - message from active chat user');
            } else {
              console.log('⏭️ Skipping notification - no current user');
            }
          }
          
          // Return the same currentUser state (no change)
          return currentUserState;
        });
        
        // Return the same activeDirectChatUserId state (no change)
        return currentActiveChat;
      });
      
      if (parsedMessage.isDirectMessage) {
        console.log('💬 Adding to direct messages');
        // Handle direct message - add to direct messages (newest first)
        setDirectMessages(prev => [parsedMessage, ...prev]);
      } else {
        console.log('📢 Adding to public messages');
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
      // Clear unread count when starting direct chat
      setUnreadCounts(prev => {
        const hadUnread = prev[userId] || 0;
        if (hadUnread > 0) {
          console.log(`🧹 Cleared ${hadUnread} unread messages for user ${userId}`);
        }
        const newCounts = { ...prev };
        delete newCounts[userId];
        return newCounts;
      });
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

  // Clear unread count for a specific user
  const clearUnreadCount = useCallback((userId: string) => {
    console.log(`🧹 Clearing unread count for user: ${userId}`);
    setUnreadCounts(prev => {
      console.log('📊 Previous unread counts before clearing:', prev);
      const hadCount = prev[userId] || 0;
      const newCounts = { ...prev };
      delete newCounts[userId];
      console.log(`🧹 Cleared ${hadCount} unread messages for user ${userId}`);
      console.log('📊 New unread counts after clearing:', newCounts);
      return newCounts;
    });
  }, []);

  // Clear all unread counts
  const clearAllUnreadCounts = useCallback(() => {
    console.log('🧹 Clearing all unread counts');
    setUnreadCounts(prev => {
      const totalCleared = Object.values(prev).reduce((sum, count) => sum + count, 0);
      console.log(`🧹 Cleared ${totalCleared} total unread messages`);
      console.log('📊 Previous unread counts:', prev);
      console.log('📊 New unread counts: {}');
      return {};
    });
  }, []);

  // Get unread count for a specific user
  const getUnreadCount = useCallback((userId: string) => {
    return unreadCounts[userId] || 0;
  }, [unreadCounts]);

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
    unreadCounts,

    // Actions
    initializeUser,
    updateLocation,
    sendMessage,
    startDirectChat,
    setSelectedRange: handleSetSelectedRange,
    clearError,
    clearNewMessagesIndicator,
    clearUnreadCount,
    clearAllUnreadCounts,
    getUnreadCount,
    startTyping,
    stopTyping,

    // Socket service (for advanced usage)
    socketService
  };
};
