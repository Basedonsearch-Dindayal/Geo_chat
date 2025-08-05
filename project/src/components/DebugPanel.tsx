import React from 'react';
import { Message, User } from '../types';

interface DebugPanelProps {
  currentUser: User | null;
  messages: Message[];
  users: User[];
  isConnected: boolean;
  error: string | null;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  currentUser,
  messages,
  users,
  isConnected,
  error
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
        {error && <div className="text-red-400">Error: {error}</div>}
        
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
