import React, { useState, useRef, useEffect } from 'react';
import { Message, User } from '../types';
import { Send, MapPin } from 'lucide-react';
import { formatDistance } from '../utils/geolocation';

interface ChatAreaProps {
  messages: Message[];
  currentUser: User | null;
  onSendMessage: (content: string) => void;
  directChatUser?: User | null;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentUser,
  onSendMessage,
  directChatUser
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentUser) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border flex flex-col h-96">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          {directChatUser ? `Chat with ${directChatUser.username}` : 'Local Chat'}
        </h3>
        <p className="text-sm text-gray-500">
          {directChatUser 
            ? `Private conversation with ${directChatUser.username}` 
            : 'Chat with people in your area'
          }
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>
              {directChatUser 
                ? `Start chatting with ${directChatUser.username}!` 
                : 'No messages yet. Start the conversation!'
              }
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.userId === currentUser?.id;
            const distance = currentUser && !directChatUser ? formatDistance(
              Math.sqrt(
                Math.pow(message.latitude - currentUser.latitude, 2) +
                Math.pow(message.longitude - currentUser.longitude, 2)
              ) * 111
            ) : '';

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="text-xs font-medium mb-1 opacity-75">
                      {message.username}
                    </div>
                  )}
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 opacity-75 flex items-center justify-between`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {!isOwnMessage && distance && !directChatUser && (
                      <span className="ml-2">{distance}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              directChatUser 
                ? `Message ${directChatUser.username}...` 
                : "Type your message..."
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};