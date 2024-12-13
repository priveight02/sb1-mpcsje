import React from 'react';
import { motion } from 'framer-motion';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24"
    >
      <div className="max-w-2xl mx-auto px-4">
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 pt-8 pb-4 mb-6 z-10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Customize your habit tracking experience
          </p>
        </div>
        {children}
      </div>
    </motion.div>
  );
};