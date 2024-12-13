import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { SettingsCard } from '../SettingsCard';

interface NotificationsSectionProps {
  onShowNotifications: () => void;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  onShowNotifications
}) => {
  return (
    <SettingsCard
      icon={Bell}
      title="Notifications"
      description="Manage your notification preferences"
    >
      <button
        onClick={onShowNotifications}
        className="w-full flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 
                 rounded-lg p-2 transition-colors"
      >
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-medium text-gray-900 dark:text-white">Notification Settings</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure alerts and reminders
          </p>
        </div>
      </button>
    </SettingsCard>
  );
};