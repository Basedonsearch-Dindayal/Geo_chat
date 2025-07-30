
import { useState } from 'react';
import { LocationPermission } from './components/LocationPermission';
import { UsernameModal } from './components/UsernameModal';
import { RangeSelector } from './components/RangeSelector';
import { UserList } from './components/UserList';
import { ChatArea } from './components/ChatArea';
import { useLocationChat } from './hooks/useLocationChat';
import { MapPin, Users } from 'lucide-react';

function App() {
  const [locationGranted, setLocationGranted] = useState(false);
  const [usernameSet, setUsernameSet] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<GeolocationPosition | null>(null);

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
    sendMessage
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">LocalChat</h1>
                <p className="text-gray-600">Connect with people nearby</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Users className="w-4 h-4 mr-1" />
                <span>Welcome, {currentUser?.username}</span>
              </div>
              <div className="text-xs text-gray-500">
                📍 Location enabled
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
            />
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <ChatArea
              messages={messagesInRange}
              currentUser={currentUser}
              onSendMessage={sendMessage}
              directChatUser={directChatUser}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Your location is used only to connect you with nearby users. Exact coordinates are never shared.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
