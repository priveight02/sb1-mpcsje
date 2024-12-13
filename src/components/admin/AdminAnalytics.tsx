import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, TrendingUp, Clock, Calendar, Brain, 
  Globe, Zap, Target, Award, ChevronDown, ChevronUp,
  Smartphone, Laptop, Tablet, RefreshCw
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import { fetchAnalytics, type AnalyticsData } from '../../utils/analytics';
import { useAuthStore } from '../../store/authStore';
import { useHabitStore } from '../../store/habitStore';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import { securityLogger } from '../../utils/securityLogger';
import toast from 'react-hot-toast';

export const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuthStore();

  const loadAnalytics = async () => {
    try {
      setIsRefreshing(true);
      const data = await fetchAnalytics(timeRange);
      setAnalyticsData(data);
      
      securityLogger.logDataEvent(
        'read',
        user?.uid || 'system',
        'analytics',
        true
      );
    } catch (error) {
      console.error('Failed to load analytics:', error);
      securityLogger.logDataEvent(
        'read',
        user?.uid || 'system',
        'analytics',
        false
      );
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  if (isLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const userGrowthData = {
    labels: Array.from({ length: parseInt(timeRange) }, (_, i) => 
      format(subDays(new Date(), parseInt(timeRange) - 1 - i), 'MMM d')
    ),
    datasets: [
      {
        label: 'Total Users',
        data: analyticsData.userGrowth,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const habitActivityData = {
    labels: Array.from({ length: parseInt(timeRange) }, (_, i) => 
      format(subDays(new Date(), parseInt(timeRange) - 1 - i), 'MMM d')
    ),
    datasets: [
      {
        label: 'Habit Completions',
        data: analyticsData.habitActivity,
        backgroundColor: 'rgba(16, 185, 129, 0.8)'
      }
    ]
  };

  const deviceStatsData = {
    labels: ['Mobile', 'Desktop', 'Tablet'],
    datasets: [
      {
        data: [
          analyticsData.deviceStats.mobile,
          analyticsData.deviceStats.desktop,
          analyticsData.deviceStats.tablet
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Analytics Dashboard</h2>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={loadAnalytics}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-white">Total Users</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            {analyticsData.totalUsers.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm">
            <ChevronUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500">+{analyticsData.newUsers}</span>
            <span className="text-gray-400">new users</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-green-400" />
            <h3 className="font-medium text-white">Active Users</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            {analyticsData.activeUsers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">
            {Math.round((analyticsData.activeUsers / analyticsData.totalUsers) * 100)}% of total users
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium text-white">Completion Rate</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(analyticsData.completionRate)}%
          </div>
          <div className="text-sm text-gray-400">
            Average across all habits
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <h3 className="font-medium text-white">Average Streak</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(analyticsData.averageStreak)} days
          </div>
          <div className="text-sm text-gray-400">
            Across active habits
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">User Growth</h3>
          <div className="h-64">
            <Line data={userGrowthData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">Habit Activity</h3>
          <div className="h-64">
            <Bar data={habitActivityData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Device Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h3 className="text-lg font-medium text-white mb-4">Device Distribution</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64">
            <Doughnut
              data={deviceStatsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: 'white',
                    },
                  },
                },
              }}
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="space-y-4">
              {Object.entries(analyticsData.deviceStats).map(([device, count]) => (
                <div key={device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      device === 'mobile' ? 'bg-indigo-500' :
                      device === 'desktop' ? 'bg-green-500' :
                      'bg-yellow-500'
                    }`} />
                    <span className="text-white capitalize">{device}</span>
                  </div>
                  <span className="text-gray-400">
                    {Math.round((count / analyticsData.totalUsers) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Geographic Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h3 className="text-lg font-medium text-white mb-4">Geographic Distribution</h3>
        <div className="space-y-3">
          {Object.entries(analyticsData.userLocations)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([location, count]) => (
              <div key={location} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span className="text-white">{location}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{
                        width: `${(count / analyticsData.totalUsers) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-gray-400 w-12 text-right">
                    {Math.round((count / analyticsData.totalUsers) * 100)}%
                  </span>
                </div>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  );
};