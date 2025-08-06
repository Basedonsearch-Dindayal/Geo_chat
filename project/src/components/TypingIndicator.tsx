import React from 'react';

interface TypingIndicatorProps {
  typingUsers: string[];
  users: { id: string; username: string }[];
  activeDirectChatUserId?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  users,
  activeDirectChatUserId
}) => {
  // Filter typing users based on context
  const relevantTypingUsers = typingUsers.filter(userId => {
    if (activeDirectChatUserId) {
      // In direct chat, only show typing from the active chat user
      return userId === activeDirectChatUserId;
    }
    // In public chat, show all typing users
    return true;
  });

  if (relevantTypingUsers.length === 0) return null;

  const getTypingUsernames = () => {
    return relevantTypingUsers
      .map(userId => users.find(u => u.id === userId)?.username || 'Someone')
      .slice(0, 3); // Show max 3 names
  };

  const typingUsernames = getTypingUsernames();
  const remainingCount = relevantTypingUsers.length - typingUsernames.length;

  const getTypingText = () => {
    if (typingUsernames.length === 1) {
      return `${typingUsernames[0]} is typing...`;
    } else if (typingUsernames.length === 2) {
      return `${typingUsernames[0]} and ${typingUsernames[1]} are typing...`;
    } else if (typingUsernames.length === 3) {
      if (remainingCount > 0) {
        return `${typingUsernames.join(', ')} and ${remainingCount} other${remainingCount > 1 ? 's' : ''} are typing...`;
      }
      return `${typingUsernames.slice(0, -1).join(', ')} and ${typingUsernames[typingUsernames.length - 1]} are typing...`;
    }
    return 'Several people are typing...';
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex space-x-1">
        {/* Animated typing dots */}
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="italic">{getTypingText()}</span>
    </div>
  );
};
