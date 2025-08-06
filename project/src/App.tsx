
import { MapPin, Moon, Sun, Users } from 'lucide-react';
import { useState } from 'react';
import { ChatArea } from './components/ChatArea';
import { LocationPermission } from './components/LocationPermission';
import { NotificationSettingsPanel } from './components/NotificationSettingsPanel';
import { RangeSelector } from './components/RangeSelector';
import { UserList } from './components/UserList';
import { UsernameModal } from './components/UsernameModal';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useLocationChat } from './hooks/useLocationChat';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [locationGranted, setLocationGranted] = useState(false);
  const [usernameSet, setUsernameSet] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<GeolocationPosition | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    enableSounds: true,
    enableBrowserNotifications: true,
    directMessagesOnly: false,
    quietHours: { enabled: false, start: '22:00', end: '08:00' }
  });

  const {
    currentUser,
    usersInRange,
    messagesInRange,
    selectedRange,
    setSelectedRange,
    activeDirectChatUserId,
    directChatUser,
    startDirectChat,
    initializeUser,
    sendMessage,
    hasNewMessages,
    clearNewMessagesIndicator,
    unreadCounts,
    clearUnreadCount,
    typingUsers,
    startTyping,
    stopTyping
  } = useLocationChat();

  const handleLocationGranted = (position: GeolocationPosition) => {
    setUserPosition(position);
    setLocationGranted(true);
    setLocationError(null);
  };

  const handleLocationError = (error: string) => {
    setLocationError(error);
  };

  const handleUsernameSet = (username: string) => {
    if (userPosition) {
      initializeUser(userPosition, username);
      setUsernameSet(true);
    }
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
    clearNewMessagesIndicator(); // Clear indicator when user sends a message
  };

  // Calculate total unread messages
  const totalUnreadMessages = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  if (!locationGranted) {
    return (
      <LocationPermission
        onLocationGranted={handleLocationGranted}
        onLocationError={handleLocationError}
        error={locationError}
      />
    );
  }

  if (!usernameSet) {
    return <UsernameModal onUsernameSet={handleUsernameSet} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">LocalChat</h1>
                <p className="text-gray-600 dark:text-gray-300">Connect with people nearby</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Welcome, {currentUser?.username}</span>
                  {totalUnreadMessages > 0 && (
                    <div className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                      {totalUnreadMessages}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  📍 Location enabled
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <RangeSelector
              selectedRange={selectedRange}
              onRangeChange={setSelectedRange}
              userCount={usersInRange.length}
            />
            <UserList 
              users={usersInRange} 
              currentUser={currentUser}
              onStartDirectChat={startDirectChat}
              activeDirectChatUserId={activeDirectChatUserId}
              unreadCounts={unreadCounts}
              onClearUnreadCount={clearUnreadCount}
            />
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <ChatArea
              messages={messagesInRange}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              directChatUser={directChatUser}
              hasNewMessages={hasNewMessages}
              onClearNewMessages={clearNewMessagesIndicator}
              typingUsers={typingUsers}
              users={usersInRange}
              activeDirectChatUserId={activeDirectChatUserId}
              onStartTyping={startTyping}
              onStopTyping={stopTyping}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Your location is used only to connect you with nearby users. Exact coordinates are never shared.</p>
        </div>
      </div>
      
      {/* Notification Settings Panel */}
      <NotificationSettingsPanel 
        settings={notificationSettings}
        onSettingsChange={setNotificationSettings}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
