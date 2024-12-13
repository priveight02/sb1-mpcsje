import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, TrendingUp, Clock } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';
import { format, subDays } from 'date-fns';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number[];
  habitActivity: number[];
  userLocations: Record<string, number>;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    userGrowth: [],
    habitActivity: [],
    userLocations: {},
    deviceStats: {
      mobile: 0,
      desktop: 0,
      tablet: 0
    }
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      // Fetch users
      const usersRef = collection(firestore, 'users');
      const usersQuery = query(
        usersRef,
        where('createdAt', '>=', startDate.toISOString())
      );
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => doc.data());

      // Calculate metrics
      const totalUsers = users.length;
      const activeUsers = users.filter(user => 
        new Date(user.lastLoginAt) >= startDate
      ).length;
      const newUsers = users.filter(user =>
        new Date(user.createdAt) >= startDate
      ).length;

      // Calculate user growth
      const userGrowth = Array.from({ length: days }, (_, i) => {
        const date = subDays(new Date(), days - i - 1);
        return users.filter(user => 
          new Date(user.createdAt).toDateString() === date.toDateString()
        ).length;
      });

      // Calculate habit activity
      const habitsRef = collection(firestore, 'habits');
      const habitsSnapshot = await getDocs(habitsRef);
      const habits = habitsSnapshot.docs.map(doc => doc.data());

      const habitActivity = Array.from({ length: days }, (_, i) => {
        const date = format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd');
        return habits.reduce((sum, habit) => 
          sum + (habit.completedDates?.includes(date) ? 1 : 0), 0
        );
      });

      setData({
        totalUsers,
        activeUsers,
        newUsers,
        userGrowth,
        habitActivity,
        userLocations: calculateUserLocations(users),
        deviceStats: calculateDeviceStats(users)
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const calculateUserLocations = (users: any[]): Record<string, number> => {
    const locations: Record<string, number> = {};
    users.forEach(user => {
      if (user.location) {
        locations[user.location] = (locations[user.location] || 0) + 1;
      }
    });
    return locations;
  };

  const calculateDeviceStats = (users: any[]): { mobile: number; desktop: number; tablet: number } => {
    const stats = { mobile: 0, desktop: 0, tablet: 0 };
    users.forEach(user => {
      if (user.lastDevice) {
        stats[user.lastDevice.type] = (stats[user.lastDevice.type] || 0) + 1;
      }
    });
    return stats;
  };

  const chartData = {
    labels: Array.from({ length: parseInt(timeRange) }, (_, i) => 
      format(subDays(new Date(), parseInt(timeRange) - 1 - i), 'MMM d')
    ),
    datasets: [
      {
        label: 'User Growth',
        data: data.userGrowth,
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.4
      },
      {
        label: 'Habit Activity',
        data: data.habitActivity,
        borderColor: 'rgb(34, 197, 94)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
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
          <div className="text-2xl font-bold text-white">{data.totalUsers}</div>
          <div className="text-sm text-gray-400">
            +{data.newUsers} new users
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
          <div className="text-2xl font-bold text-white">{data.activeUsers}</div>
          <div className="text-sm text-gray-400">
            {Math.round((data.activeUsers / data.totalUsers) * 100)}% of total
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium text-white">Growth Rate</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round((data.newUsers / data.totalUsers) * 100)}%
          </div>
          <div className="text-sm text-gray-400">Last {timeRange}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h3 className="font-medium text-white">Avg. Session</h3>
          </div>
          <div className="text-2xl font-bold text-white">12m</div>
          <div className="text-sm text-gray-400">Per user</div>
        </motion.div>
      </div>

      {/* Growth Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Growth & Activity</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
        <div className="h-[300px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Device Distribution */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h3 className="text-lg font-medium text-white mb-6">Device Distribution</h3>
        <div className="h-[200px]">
          <Bar
            data={{
              labels: ['Mobile', 'Desktop', 'Tablet'],
              datasets: [{
                data: [
                  data.deviceStats.mobile,
                  data.deviceStats.desktop,
                  data.deviceStats.tablet
                ],
                backgroundColor: [
                  'rgba(99, 102, 241, 0.8)',
                  'rgba(34, 197, 94, 0.8)',
                  'rgba(168, 85, 247, 0.8)'
                ]
              }]
            }}
            options={{
              ...chartOptions,
              indexAxis: 'y' as const
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};