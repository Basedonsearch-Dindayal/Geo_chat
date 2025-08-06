import React from 'react';
import { Message, User } from '../types';

interface DebugPanelProps {
  currentUser: User | null;
  messages: Message[];
  users: User[];
  isConnected: boolean;
  error: string | null;
  unreadCounts?: Record<string, number>;
  onClearUnreadCount?: (userId: string) => void;
  onClearAllUnreadCounts?: () => void;
  onTestNotification?: (username?: string, userId?: string) => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  currentUser,
  messages,
  users,
  isConnected,
  error,
  unreadCounts = {},
  onClearUnreadCount,
  onClearAllUnreadCounts,
  onTestNotification
}) => {
  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div className="space-y-1">
        <div>Connected: <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
          {isConnected ? 'Yes' : 'No'}
        </span></div>
        <div>Current User: {currentUser ? currentUser.username : 'None'}</div>
        <div>Messages: {messages.length}</div>
        <div>Users: {users.length}</div>
        <div>Unread: {Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
        
        {Object.keys(unreadCounts).length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer">Unread Counts</summary>
            <div className="mt-1 space-y-1">
              {Object.entries(unreadCounts).map(([userId, count]) => {
                const user = users.find(u => u.id === userId);
                return (
                  <div key={userId} className="flex justify-between items-center text-xs">
                    <span>{user?.username || userId}: {count}</span>
                    {onClearUnreadCount && (
                      <button
                        onClick={() => onClearUnreadCount(userId)}
                        className="ml-2 px-1 py-0.5 bg-red-600 rounded text-xs hover:bg-red-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                );
              })}
              {onClearAllUnreadCounts && (
                <button
                  onClick={onClearAllUnreadCounts}
                  className="w-full mt-2 px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
                >
                  Clear All
                </button>
              )}
            </div>
          </details>
        )}
        
        {/* Test button to force unread counts in development */}
        <button
          onClick={() => {
            console.log('🧪 Testing notification system...');
            if (onTestNotification) {
              // Use the proper test function from the hook
              onTestNotification();
            } else if (users.length > 0 && onClearUnreadCount) {
              const testUserId = users[0].id;
              console.log('🎯 Simulating message from user:', testUserId);
              // This would normally be done by the useLocationChat hook
              window.dispatchEvent(new CustomEvent('test-notification', { 
                detail: { userId: testUserId, username: users[0].username } 
              }));
            }
          }}
          className="w-full mt-2 px-2 py-1 bg-purple-600 rounded text-xs hover:bg-purple-700"
        >
          Test Notification
        </button>
        
        <details className="mt-2">
          <summary className="cursor-pointer">Messages</summary>
          <div className="mt-1 max-h-32 overflow-y-auto">
            {messages.map(msg => (
              <div key={msg.id} className="border-t border-gray-600 pt-1 mt-1 text-xs">
                <div><strong>{msg.username}:</strong> {msg.content}</div>
                <div className="text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
            {messages.length === 0 && <div className="text-gray-400">No messages</div>}
          </div>
        </details>
      </div>
    </div>
  );
};
