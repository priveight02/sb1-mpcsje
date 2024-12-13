import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserSettingsLayout } from './UserSettingsLayout';
import { ProfileSettings } from './sections/ProfileSettings';
import { EmailSettings } from './sections/EmailSettings';
import { SecuritySettings } from './sections/SecuritySettings';
import { SecurityMonitoring } from './sections/SecurityMonitoring';
import { NotificationSettings } from './sections/NotificationSettings';
import { PrivacySettings } from './sections/PrivacySettings';
import { useAuthStore } from '../../store/authStore';

export const UserSettings: React.FC = () => {
  const { user, isGuest } = useAuthStore();

  if (!user || isGuest) {
    return <Navigate to="/" replace />;
  }

  return (
    <UserSettingsLayout>
      <Routes>
        <Route index element={<ProfileSettings />} />
        <Route path="email" element={<EmailSettings />} />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="monitoring" element={<SecurityMonitoring />} />
        <Route path="notifications" element={<NotificationSettings />} />
        <Route path="privacy" element={<PrivacySettings />} />
      </Routes>
    </UserSettingsLayout>
  );
};