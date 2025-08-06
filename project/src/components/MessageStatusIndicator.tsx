import { Check, CheckCheck } from 'lucide-react';
import React from 'react';

export interface MessageStatus {
  sent: boolean;
  delivered: boolean;
  read: boolean;
}

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  isOwnMessage: boolean;
}

export const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({
  status,
  isOwnMessage
}) => {
  if (!isOwnMessage) return null;

  const getStatusColor = () => {
    if (status.read) return 'text-blue-500';
    if (status.delivered) return 'text-gray-500';
    if (status.sent) return 'text-gray-400';
    return 'text-gray-300';
  };

  const getStatusIcon = () => {
    if (status.delivered || status.read) {
      return <CheckCheck className="w-4 h-4" />;
    }
    if (status.sent) {
      return <Check className="w-4 h-4" />;
    }
    return <div className="w-4 h-4 border-2 border-gray-300 rounded-full border-t-transparent animate-spin" />;
  };

  return (
    <div className={`inline-flex items-center ml-1 ${getStatusColor()}`}>
      {getStatusIcon()}
    </div>
  );
};
