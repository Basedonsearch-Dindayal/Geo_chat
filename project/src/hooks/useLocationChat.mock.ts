import { useState, useCallback } from 'react';
import { User, Message, DistanceRange, DirectChat } from '../types';
import { calculateDistance } from '../utils/geolocation';

// Mock data for demonstration
const generateMockUsers = (userLocation: { lat: number; lng: number }): User[] => {
  const mockUsers: User[] = [
    {
      id: '2',
      username: 'Alex',
      latitude: userLocation.lat + 0.005,
      longitude: userLocation.lng + 0.003,
      lastSeen: new Date(),
      isOnline: true
    },
    {
      id: '3',
      username: 'Sarah',
      latitude: userLocation.lat - 0.008,
      longitude: userLocation.lng + 0.006,
      lastSeen: new Date(Date.now() - 300000),
      isOnline: false
    },
    {
      id: '4',
      username: 'Mike',
      latitude: userLocation.lat + 0.012,
      longitude: userLocation.lng - 0.004,
      lastSeen: new Date(),
      isOnline: true
    },
    {
      id: '5',
      username: 'Emma',
      latitude: userLocation.lat - 0.015,
      longitude: userLocation.lng - 0.008,
      lastSeen: new Date(),
      isOnline: true
    }
  ];

  return mockUsers;
};

const generateMockMessages = (users: User[]): Message[] => {
  const messages: Message[] = [
    {
      id: '1',
      userId: '2',
      username: 'Alex',
      content: 'Hey everyone! Beautiful day today 🌞',
      timestamp: new Date(Date.now() - 600000),
      latitude: users.find(u => u.id === '2')?.latitude || 0,
      longitude: users.find(u => u.id === '2')?.longitude || 0
    },
    {
      id: '2',
      userId: '4',
      username: 'Mike',
      content: 'Anyone know what\'s happening at the park?',
      timestamp: new Date(Date.now() - 300000),
      latitude: users.find(u => u.id === '4')?.latitude || 0,
      longitude: users.find(u => u.id === '4')?.longitude || 0
    },
    {
      id: '3',
      userId: '5',
      username: 'Emma',
      content: 'There\'s a food truck festival! 🌮',
      timestamp: new Date(Date.now() - 120000),
      latitude: users.find(u => u.id === '5')?.latitude || 0,
      longitude: users.find(u => u.id === '5')?.longitude || 0
    }
  ];

  return messages;
};

export const useLocationChat = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [directChats, setDirectChats] = useState<DirectChat[]>([]);
  const [activeDirectChatUserId, setActiveDirectChatUserId] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<DistanceRange>(5);

  const initializeUser = useCallback((position: GeolocationPosition, username: string) => {
    const user: User = {
      id: '1',
      username,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      lastSeen: new Date(),
      isOnline: true
    };

    setCurrentUser(user);

    // Generate mock users and messages
    const mockUsers = generateMockUsers({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
    
    const allUsersWithCurrent = [user, ...mockUsers];
    setAllUsers(allUsersWithCurrent);
    setMessages(generateMockMessages(mockUsers));
  }, []);

  const startDirectChat = useCallback((userId: string) => {
    if (!currentUser || userId === currentUser.id) return;
    
    if (userId === '') {
      setActiveDirectChatUserId('');
      return;
    }

    setActiveDirectChatUserId(userId);
    
    // Check if direct chat already exists
    const existingChat = directChats.find(chat => 
      chat.participants.includes(currentUser.id) && chat.participants.includes(userId)
    );

    if (!existingChat) {
      // Create new direct chat
      const newDirectChat: DirectChat = {
        id: `${currentUser.id}-${userId}`,
        participants: [currentUser.id, userId],
        messages: [],
        lastActivity: new Date()
      };
      setDirectChats(prev => [...prev, newDirectChat]);
    }
  }, [currentUser, directChats]);
  const getUsersInRange = useCallback(() => {
    if (!currentUser) return [];

    return allUsers.filter(user => {
      if (user.id === currentUser.id) return false;
      
      const distance = calculateDistance(
        currentUser.latitude,
        currentUser.longitude,
        user.latitude,
        user.longitude
      );
      
      return distance <= selectedRange;
    });
  }, [currentUser, allUsers, selectedRange]);

  const getMessagesInRange = useCallback(() => {
    if (!currentUser) return [];

    // If in direct chat mode, show only direct messages
    if (activeDirectChatUserId) {
      const directChat = directChats.find(chat => 
        chat.participants.includes(currentUser.id) && 
        chat.participants.includes(activeDirectChatUserId)
      );
      return directChat ? directChat.messages : [];
    }

    // Otherwise show public messages in range
    return messages.filter(message => {
      if (message.isDirectMessage) return false;
      
      const distance = calculateDistance(
        currentUser.latitude,
        currentUser.longitude,
        message.latitude,
        message.longitude
      );
      
      return distance <= selectedRange;
    });
  }, [currentUser, messages, selectedRange, activeDirectChatUserId, directChats]);

  const sendMessage = useCallback((content: string) => {
    if (!currentUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      content,
      timestamp: new Date(),
      latitude: currentUser.latitude,
      longitude: currentUser.longitude
    };

    if (activeDirectChatUserId) {
      // Send direct message
      const directMessage: Message = {
        ...newMessage,
        recipientId: activeDirectChatUserId,
        isDirectMessage: true
      };

      setDirectChats(prev => prev.map(chat => {
        if (chat.participants.includes(currentUser.id) && 
            chat.participants.includes(activeDirectChatUserId)) {
          return {
            ...chat,
            messages: [...chat.messages, directMessage],
            lastActivity: new Date()
          };
        }
        return chat;
      }));
    } else {
      // Send public message
      setMessages(prev => [...prev, newMessage]);
    }
  }, [currentUser, activeDirectChatUserId]);

  const getDirectChatUser = useCallback(() => {
    if (!activeDirectChatUserId || !currentUser) return null;
    return allUsers.find(user => user.id === activeDirectChatUserId) || null;
  }, [activeDirectChatUserId, currentUser, allUsers]);
  return {
    currentUser,
    usersInRange: getUsersInRange(),
    messagesInRange: getMessagesInRange(),
    selectedRange,
    setSelectedRange,
    activeDirectChatUserId,
    directChatUser: getDirectChatUser(),
    startDirectChat,
    initializeUser,
    sendMessage
  };
};