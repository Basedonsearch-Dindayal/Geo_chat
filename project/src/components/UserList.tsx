import { Circle, MapPin } from 'lucide-react';
import React from 'react';
import { User } from '../types';
import { formatDistance } from '../utils/geolocation';

interface UserListProps {
  users: User[];
  currentUser: User | null;
  onStartDirectChat: (userId: string) => void;
  activeDirectChatUserId?: string;
}

export const UserList: React.FC<UserListProps> = ({ 
  users, 
  currentUser, 
  onStartDirectChat,
  activeDirectChatUserId 
}) => {
  if (!currentUser) return null;

  const otherUsers = users.filter(user => user.id !== currentUser.id);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
        <MapPin className="w-4 h-4 mr-1" />
        People Nearby ({otherUsers.length})
      </h3>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {otherUsers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">
            No one nearby right now
          </p>
        ) : (
          otherUsers.map((user) => (
            <div 
              key={user.id} 
              className={`flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                activeDirectChatUserId === user.id 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onStartDirectChat(user.id)}
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
                      user.isOnline ? 'text-green-500 fill-current' : 'text-gray-400 fill-current'
                    }`}
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-800">
                  {user.username}
                </span>
                {activeDirectChatUserId === user.id && (
                  <span className="ml-2 text-xs text-blue-600 font-medium">
                    • Chatting
                  </span>
                )}
                {!user.isOnline && (
                  <span className="ml-2 text-xs text-gray-400">
                    • Last seen {new Date(user.lastSeen).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatDistance(
                  Math.sqrt(
                    Math.pow(user.latitude - currentUser.latitude, 2) +
                    Math.pow(user.longitude - currentUser.longitude, 2)
                  ) * 111 // Rough conversion to km
                )}
              </span>
            </div>
          ))
        )}
      </div>
      {activeDirectChatUserId && (
        <div className="mt-3 pt-3 border-t">
          <button
            onClick={() => onStartDirectChat('')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to group chat
          </button>
        </div>
      )}
    </div>
  );
};