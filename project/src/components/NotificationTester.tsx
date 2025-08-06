import React, { useState } from 'react';

export const NotificationTester: React.FC = () => {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  
  const mockUsers = [
    { id: 'alice', username: 'Alice' },
    { id: 'bob', username: 'Bob' },
    { id: 'charlie', username: 'Charlie' }
  ];

  const simulateMessage = (userId: string, username: string) => {
    setUnreadCounts(prev => {
      const newCount = (prev[userId] || 0) + 1;
      console.log(`📨 Message from ${username}: ${prev[userId] || 0} → ${newCount} unread messages`);
      return { ...prev, [userId]: newCount };
    });

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const count = (unreadCounts[userId] || 0) + 1;
      const title = `Direct message from ${username} (${count} unread)`;
      const body = count > 1 ? `New message (+${count - 1} more messages)` : 'New message';
      
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: `message-${userId}`,
      });
    }
  };

  const clearUser = (userId: string) => {
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[userId];
      return newCounts;
    });
  };

  const clearAll = () => {
    setUnreadCounts({});
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  };

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="text-sm font-bold mb-3 text-gray-800 dark:text-white">🧪 Notification Tester</h3>
      
      {/* Total Unread Badge */}
      <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">Total Unread:</span>
          {totalUnread > 0 && (
            <div className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
              {totalUnread}
            </div>
          )}
          {totalUnread === 0 && <span className="text-gray-500">0</span>}
        </div>
      </div>

      {/* Mock User List */}
      <div className="space-y-2 mb-3">
        {mockUsers.map(user => {
          const unreadCount = unreadCounts[user.id] || 0;
          return (
            <div key={user.id} className="flex items-center justify-between p-2 border dark:border-gray-600 rounded">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user.username.charAt(0)}
                    </span>
                  </div>
                  {/* Unread Badge */}
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {user.username}
                  </div>
                  {unreadCount > 0 && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {unreadCount} new message{unreadCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => clearUser(user.id)}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                disabled={unreadCount === 0}
              >
                Clear
              </button>
            </div>
          );
        })}
      </div>

      {/* Test Buttons */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Simulate Messages:</div>
        {mockUsers.map(user => (
          <button
            key={user.id}
            onClick={() => simulateMessage(user.id, user.username)}
            className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded"
          >
            {user.username} sends message
          </button>
        ))}
        
        <button
          onClick={clearAll}
          className="w-full text-xs bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded mt-2"
        >
          Clear All
        </button>
        
        <button
          onClick={requestNotificationPermission}
          className="w-full text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded"
        >
          Enable Notifications
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Check browser console for logs
      </div>
    </div>
  );
};
