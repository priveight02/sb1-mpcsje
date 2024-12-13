import React from 'react';
import { Users, Award, Target, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useHabitStore } from '../../store/habitStore';
import { useLeaderboardStore } from '../../store/leaderboardStore';

export const AdminStats: React.FC = () => {
  const totalUsers = useAuthStore((state) => state.getTotalUsers?.() || 0);
  const habits = useHabitStore((state) => state.habits);
  const leaderboard = useLeaderboardStore((state) => state.users);

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Active Habits',
      value: habits.length,
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'text-green-500',
    },
    {
      label: 'Completion Rate',
      value: '78%',
      change: '+5%',
      trend: 'up',
      icon: Award,
      color: 'text-yellow-500',
    },
    {
      label: 'System Load',
      value: '0.8',
      change: '-2%',
      trend: 'down',
      icon: Zap,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-6">System Overview</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className={`text-sm ${
                stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};