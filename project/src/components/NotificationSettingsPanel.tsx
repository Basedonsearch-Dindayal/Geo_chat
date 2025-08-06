import { Bell, BellOff, Volume2, VolumeX } from 'lucide-react';
import React, { useState } from 'react';

interface NotificationSettings {
  enableSounds: boolean;
  enableBrowserNotifications: boolean;
  directMessagesOnly: boolean;
  quietHours: { enabled: boolean; start: string; end: string };
}

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
}

export const NotificationSettingsPanel: React.FC<NotificationSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200 z-50"
        title="Notification Settings"
      >
        {settings.enableBrowserNotifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 p-6 z-50 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Notification Settings
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Browser Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Browser Notifications</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableBrowserNotifications}
              onChange={(e) => updateSetting('enableBrowserNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Sound Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {settings.enableSounds ? (
              <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">Sound Notifications</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableSounds}
              onChange={(e) => updateSetting('enableSounds', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Direct Messages Only */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Direct Messages Only</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Only notify for private messages</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.directMessagesOnly}
              onChange={(e) => updateSetting('directMessagesOnly', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Quiet Hours */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Quiet Hours</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.quietHours.enabled}
                onChange={(e) => updateSetting('quietHours', { 
                  ...settings.quietHours, 
                  enabled: e.target.checked 
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {settings.quietHours.enabled && (
            <div className="flex space-x-2 text-sm">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
                <input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => updateSetting('quietHours', {
                    ...settings.quietHours,
                    start: e.target.value
                  })}
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
                <input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => updateSetting('quietHours', {
                    ...settings.quietHours,
                    end: e.target.value
                  })}
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
