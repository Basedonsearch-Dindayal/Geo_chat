import { Circle, MapPin } from 'lucide-react';
import React from 'react';
import { User } from '../types';
import { formatDistance } from '../utils/geolocation';

interface UserListProps {
  users: User[];
  currentUser: User | null;
  onStartDirectChat: (userId: string) => void;
  activeDirectChatUserId?: string;
  unreadCounts?: Record<string, number>;
  onClearUnreadCount?: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ 
  users, 
  currentUser, 
  onStartDirectChat,
  activeDirectChatUserId,
  unreadCounts = {},
  onClearUnreadCount
}) => {
  if (!currentUser) return null;

  const otherUsers = users.filter(user => user.id !== currentUser.id);

  // Sort users: active users first, then by distance
  const sortedUsers = [...otherUsers].sort((a, b) => {
    // First priority: online status (active users at top)
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    
    // Second priority: distance (closer users first)
    const distanceA = Math.sqrt(
      Math.pow(a.latitude - currentUser.latitude, 2) +
      Math.pow(a.longitude - currentUser.longitude, 2)
    );
    const distanceB = Math.sqrt(
      Math.pow(b.latitude - currentUser.latitude, 2) +
      Math.pow(b.longitude - currentUser.longitude, 2)
    );
    
    return distanceA - distanceB;
  });

  const handleUserClick = (userId: string) => {
    // Clear unread count when starting a chat
    if (onClearUnreadCount && unreadCounts[userId]) {
      onClearUnreadCount(userId);
    }
    onStartDirectChat(userId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
        <MapPin className="w-4 h-4 mr-1" />
        People Nearby ({otherUsers.length})
      </h3>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {sortedUsers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
            No one nearby right now
          </p>
        ) : (
          sortedUsers.map((user) => {
            const unreadCount = unreadCounts[user.id] || 0;
            return (
              <div 
                key={user.id} 
                className={`flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                  activeDirectChatUserId === user.id 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleUserClick(user.id)}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <Circle
                      className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                        user.isOnline 
                          ? 'text-green-500 fill-current' 
                          : new Date().getTime() - new Date(user.lastSeen).getTime() < 5 * 60 * 1000 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-400 fill-current'
                      }`}
                    />
                    {/* Unread message count badge */}
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-2 flex-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {user.username}
                      </span>
                      {activeDirectChatUserId === user.id && (
                        <span className="ml-2 text-xs text-blue-600 font-medium">
                          • Chatting
                        </span>
                      )}
                    </div>
                    {!user.isOnline && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Last seen {new Date(user.lastSeen).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistance(
                    Math.sqrt(
                      Math.pow(user.latitude - currentUser.latitude, 2) +
                      Math.pow(user.longitude - currentUser.longitude, 2)
                    ) * 111 // Rough conversion to km
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>
      {activeDirectChatUserId && (
        <div className="mt-3 pt-3 border-t dark:border-gray-700">
          <button
            onClick={() => onStartDirectChat('')}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            ← Back to group chat
          </button>
        </div>
      )}
    </div>
  );
};