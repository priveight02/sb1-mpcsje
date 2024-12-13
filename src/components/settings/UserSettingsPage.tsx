import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Palette } from 'lucide-react';
import { ProfileSettings } from './sections/ProfileSettings';
import { SecuritySettings } from './sections/SecuritySettings';
import { NotificationSettings } from './sections/NotificationSettings';
import { ThemeSettings } from './sections/ThemeSettings';
import { SettingsSection } from './SettingsSection';

export const UserSettingsPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto px-4 py-8 space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        User Settings
      </h1>

      <SettingsSection
        icon={User}
        title="Profile"
        description="Manage your personal information"
      >
        <ProfileSettings />
      </SettingsSection>

      <SettingsSection
        icon={Shield}
        title="Security"
        description="Update your security preferences"
      >
        <SecuritySettings />
      </SettingsSection>

      <SettingsSection
        icon={Bell}
        title="Notifications"
        description="Configure your notification settings"
      >
        <NotificationSettings />
      </SettingsSection>

      <SettingsSection
        icon={Palette}
        title="Appearance"
        description="Customize your app experience"
      >
        <ThemeSettings />
      </SettingsSection>
    </motion.div>
  );
};