import React from 'react';
import { usePrivacyStore } from '../../../store/privacyStore';
import { Shield, Eye, Lock } from 'lucide-react';
import { AnimatedCheckbox } from '../../shared/AnimatedCheckbox';
import toast from 'react-hot-toast';

export const PrivacySettings: React.FC = () => {
  const { settings, updateSettings } = usePrivacyStore();

  const handleEncryptionToggle = () => {
    if (!settings.encryptData && !settings.encryptionKey) {
      const key = crypto.randomUUID();
      updateSettings({ encryptData: true, encryptionKey: key });
      toast.success('Encryption enabled! Make sure to save your key.');
    } else {
      updateSettings({ encryptData: !settings.encryptData });
      toast.success(settings.encryptData ? 'Encryption disabled' : 'Encryption enabled');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Data Encryption
            </span>
          </div>
          <AnimatedCheckbox
            checked={settings.encryptData}
            onChange={handleEncryptionToggle}
            variant="settings"
            color="#6366F1"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Hide Streak Count
            </span>
          </div>
          <AnimatedCheckbox
            checked={settings.hideStreak}
            onChange={() => updateSettings({ hideStreak: !settings.hideStreak })}
            variant="settings"
            color="#6366F1"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Private Mode
            </span>
          </div>
          <AnimatedCheckbox
            checked={settings.privateMode}
            onChange={() => updateSettings({ privateMode: !settings.privateMode })}
            variant="settings"
            color="#6366F1"
          />
        </div>

        {settings.encryptData && settings.encryptionKey && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Encryption Key</h4>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">
                {settings.encryptionKey}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(settings.encryptionKey || '');
                  toast.success('Encryption key copied to clipboard');
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Store this key safely. You'll need it to recover your data if you clear your browser data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};