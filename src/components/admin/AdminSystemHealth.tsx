import React from 'react';
import { Server, Database, Cloud, Cpu } from 'lucide-react';

export const AdminSystemHealth: React.FC = () => {
  const metrics = [
    {
      label: 'Server Status',
      value: 'Healthy',
      icon: Server,
      status: 'success',
    },
    {
      label: 'Database Load',
      value: '42%',
      icon: Database,
      status: 'success',
    },
    {
      label: 'Storage Usage',
      value: '68%',
      icon: Cloud,
      status: 'warning',
    },
    {
      label: 'Memory Usage',
      value: '75%',
      icon: Cpu,
      status: 'warning',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
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
      <h2 className="text-xl font-semibold text-white mb-6">System Health</h2>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <metric.icon className={getStatusColor(metric.status)} />
              <span className="text-gray-300">{metric.label}</span>
            </div>
            <span className={`font-medium ${getStatusColor(metric.status)}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};