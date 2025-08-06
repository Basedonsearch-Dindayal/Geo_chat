import { MapPin, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Message, User } from '../types';
import { MessageStatusIndicator } from './MessageStatusIndicator';
import { TypingIndicator } from './TypingIndicator';

interface ChatAreaProps {
  messages: Message[];
  currentUser: User | null;
  onSendMessage: (content: string) => void;
  directChatUser?: User | null;
  hasNewMessages?: boolean;
  onClearNewMessages?: () => void;
  typingUsers?: string[];
  users?: User[];
  activeDirectChatUserId?: string;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentUser,
  onSendMessage,
  directChatUser,
  hasNewMessages = false,
  onClearNewMessages,
  typingUsers = [],
  users = [],
  activeDirectChatUserId,
  onStartTyping,
  onStopTyping
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number>();

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Start typing indicator
    if (value.trim() && !isTyping && onStartTyping) {
      setIsTyping(true);
      onStartTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = window.setTimeout(() => {
      if (isTyping && onStopTyping) {
        setIsTyping(false);
        onStopTyping();
      }
    }, 2000);

    // Stop typing immediately if input is empty
    if (!value.trim() && isTyping && onStopTyping) {
      setIsTyping(false);
      onStopTyping();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear new messages indicator when component receives focus or user starts typing
  useEffect(() => {
    if (hasNewMessages && onClearNewMessages) {
      const timer = setTimeout(() => {
        onClearNewMessages();
      }, 3000); // Auto-clear after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [hasNewMessages, onClearNewMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentUser) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      
      // Stop typing indicator when message is sent
      if (isTyping && onStopTyping) {
        setIsTyping(false);
        onStopTyping();
      }
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(dateObj);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 flex flex-col h-96 md:h-[500px]">
      <div className="p-4 border-b relative">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          {directChatUser ? `Chat with ${directChatUser.username}` : 'Local Chat'}
          {hasNewMessages && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
              New messages
            </span>
          )}
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
          [...messages].reverse().map((message) => {
            const isOwnMessage = message.userId === currentUser?.id;
            
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
                    <MessageStatusIndicator 
                      status={message.status || { sent: true, delivered: false, read: false }}
                      isOwnMessage={isOwnMessage}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      <TypingIndicator 
        typingUsers={typingUsers} 
        users={users} 
        activeDirectChatUserId={activeDirectChatUserId}
      />

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              handleInputChange(e);
              // Clear new messages indicator when user starts typing
              if (hasNewMessages && onClearNewMessages) {
                onClearNewMessages();
              }
            }}
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
