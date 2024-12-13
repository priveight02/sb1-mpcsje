import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { User, Shield, Bell, Lock, Mail, ArrowLeft, Activity } from 'lucide-react';

interface UserSettingsLayoutProps {
  children: React.ReactNode;
}

export const UserSettingsLayout: React.FC<UserSettingsLayoutProps> = ({ children }) => {
  const location = useLocation();

  const tabs = [
    { id: '/user-settings', icon: User, label: 'Profile' },
    { id: '/user-settings/email', icon: Mail, label: 'Email' },
    { id: '/user-settings/security', icon: Shield, label: 'Security' },
    { id: '/user-settings/monitoring', icon: Activity, label: 'Monitoring' },
    { id: '/user-settings/notifications', icon: Bell, label: 'Notifications' },
    { id: '/user-settings/privacy', icon: Lock, label: 'Privacy' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="max-w-3xl mx-auto px-4">
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 pt-8 pb-4 mb-6 z-10">
          <div className="flex items-center gap-4 mb-4">
            <NavLink 
              to="/"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </NavLink>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Settings</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-56 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map(({ id, icon: Icon, label }) => (
                <NavLink
                  key={id}
                  to={id}
                  end={id === '/user-settings'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="font-medium">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};