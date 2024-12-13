import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Activity, AlertTriangle } from 'lucide-react';

export const AdminActionLog: React.FC = () => {
  const logs = [
    {
      id: 1,
      type: 'user',
      message: 'New user registration',
      timestamp: '2 minutes ago',
      icon: User,
      severity: 'info',
    },
    {
      id: 2,
      type: 'system',
      message: 'Database backup completed',
      timestamp: '15 minutes ago',
      icon: Activity,
      severity: 'success',
    },
    {
      id: 3,
      type: 'error',
      message: 'Failed login attempt',
      timestamp: '1 hour ago',
      icon: AlertTriangle,
      severity: 'error',
    },
    {
      id: 4,
      type: 'system',
      message: 'System update scheduled',
      timestamp: '2 hours ago',
      icon: Clock,
      severity: 'warning',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-6">System Activity</h2>
      <div className="space-y-4">
        {logs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg"
          >
            <div className={`${getSeverityColor(log.severity)}`}>
              <log.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-white">{log.message}</p>
              <p className="text-sm text-gray-400">{log.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};