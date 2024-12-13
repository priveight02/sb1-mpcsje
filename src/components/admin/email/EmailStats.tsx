import React from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';

interface EmailStatsProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const EmailStats: React.FC<EmailStatsProps> = ({ timeRange, onTimeRangeChange }) => {
  const days = parseInt(timeRange);
  const labels = Array.from({ length: days }, (_, i) => 
    format(subDays(new Date(), days - 1 - i), 'MMM d')
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Sent Emails',
        data: Array.from({ length: days }, () => Math.floor(Math.random() * 100)),
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.4
      },
      {
        label: 'Opens',
        data: Array.from({ length: days }, () => Math.floor(Math.random() * 80)),
        borderColor: 'rgb(34, 197, 94)',
        tension: 0.4
      },
      {
        label: 'Clicks',
        data: Array.from({ length: days }, () => Math.floor(Math.random() * 40)),
        borderColor: 'rgb(168, 85, 247)',
        tension: 0.4
      }
    ]
  };

  const options = {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white">Email Performance</h3>
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>
      <div className="h-[300px]">
        <Line data={data} options={options} />
      </div>
    </motion.div>
  );
};