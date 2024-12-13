import React from 'react';
import { useNotificationStore } from '../../../store/notificationStore';
import { Bell, Clock, Moon } from 'lucide-react';
import { AnimatedCheckbox } from '../../shared/AnimatedCheckbox';
import toast from 'react-hot-toast';

export const NotificationSettings: React.FC = () => {
  const { preferences, updatePreferences } = useNotificationStore();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Notifications
            </span>
          </div>
          <AnimatedCheckbox
            checked={preferences.enabled}
            onChange={() => {
              const newValue = !preferences.enabled;
              updatePreferences({ enabled: newValue });
              if (newValue) {
                Notification.requestPermission();
              }
              toast.success(newValue ? 'Notifications enabled' : 'Notifications disabled');
            }}
            variant="settings"
            color="#6366F1"
          />
        </div>

        {preferences.enabled && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Daily Reminders
                </span>
              </div>
              <AnimatedCheckbox
                checked={preferences.dailyReminders}
                onChange={() => updatePreferences({ dailyReminders: !preferences.dailyReminders })}
                variant="settings"
                color="#6366F1"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quiet Hours
                </span>
              </div>
              <AnimatedCheckbox
                checked={preferences.quietHours.enabled}
                onChange={() => 
                  updatePreferences({ 
                    quietHours: { ...preferences.quietHours, enabled: !preferences.quietHours.enabled } 
                  })
                }
                variant="settings"
                color="#6366F1"
              />
            </div>

            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => 
                      updatePreferences({
                        quietHours: { ...preferences.quietHours, start: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg
                             dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => 
                      updatePreferences({
                        quietHours: { ...preferences.quietHours, end: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg
                             dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};