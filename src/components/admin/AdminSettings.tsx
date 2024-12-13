import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Database, Cloud, Shield, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminSettings: React.FC = () => {
  const settings = [
    {
      id: 'maintenance',
      label: 'Maintenance Mode',
      description: 'Enable maintenance mode to prevent user access',
      icon: Settings,
      enabled: false,
    },
    {
      id: 'backups',
      label: 'Automatic Backups',
      description: 'Schedule regular database backups',
      icon: Database,
      enabled: true,
    },
    {
      id: 'notifications',
      label: 'System Notifications',
      description: 'Send notifications for system events',
      icon: Bell,
      enabled: true,
    },
    {
      id: 'security',
      label: 'Enhanced Security',
      description: 'Enable additional security measures',
      icon: Shield,
      enabled: true,
    },
  ];

  const handleToggleSetting = (settingId: string) => {
    toast.success(`Setting "${settingId}" updated`);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-6">System Settings</h2>
      <div className="space-y-4">
        {settings.map((setting) => (
          <motion.div
            key={setting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <setting.icon className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-medium text-white">{setting.label}</h3>
                <p className="text-sm text-gray-400">{setting.description}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={setting.enabled}
                onChange={() => handleToggleSetting(setting.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
                           peer-checked:after:translate-x-full peer-checked:after:border-white 
                           after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                           after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                           peer-checked:bg-indigo-600"></div>
            </label>
          </motion.div>
        ))}
      </div>
    </div>
  );
};