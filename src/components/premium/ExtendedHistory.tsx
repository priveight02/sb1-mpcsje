import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Line } from 'react-chartjs-2';

interface ExtendedHistoryProps {
  habitId: string;
  completedDates: string[];
}

export const ExtendedHistory: React.FC<ExtendedHistoryProps> = ({
  habitId,
  completedDates
}) => {
  const chartData = {
    labels: completedDates.map(date => format(parseISO(date), 'MMM d')),
    datasets: [
      {
        label: 'Completion History',
        data: completedDates.map((_, i) => i + 1),
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">Extended History</h3>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h4 className="font-medium text-white">First Completion</h4>
          </div>
          <p className="text-gray-300">
            {completedDates[0] ? 
              format(parseISO(completedDates[0]), 'MMM d, yyyy') : 
              'No completions yet'}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h4 className="font-medium text-white">Most Active Time</h4>
          </div>
          <p className="text-gray-300">9:00 AM - 11:00 AM</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h4 className="font-medium text-white">Total Completions</h4>
          </div>
          <p className="text-gray-300">{completedDates.length}</p>
        </div>
      </div>
    </div>
  );
};