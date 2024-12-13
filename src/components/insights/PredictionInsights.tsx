import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, Lightbulb, ArrowUp, ArrowDown, Clock, Calendar } from 'lucide-react';
import { usePredictionStore } from '../../store/predictionStore';
import { Line } from 'react-chartjs-2';
import { HabitVisualization } from './HabitVisualization';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PredictionInsightsProps {
  habitId: string;
}

export const PredictionInsights: React.FC<PredictionInsightsProps> = ({ habitId }) => {
  const generatePredictions = usePredictionStore((state) => state.generatePredictions);
  const prediction = usePredictionStore((state) => state.getPredictionForHabit(habitId));
  const suggestions = usePredictionStore((state) => state.getImprovementSuggestions(habitId));

  useEffect(() => {
    generatePredictions();
  }, [habitId, generatePredictions]);

  if (!prediction) return null;

  const visualizationData = {
    ...prediction.visualizationData,
    weeklyPerformance: prediction.detailedStats.weekdayCompletion,
    predictedSuccess: prediction.predictedCompletionRate,
    adaptability: prediction.detailedStats.consistency * 100,
  };

  const chartData = {
    labels: Array.from({ length: 30 }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Predicted Progress',
        data: Array.from({ length: 30 }, (_, i) => {
          const base = prediction.predictedCompletionRate;
          const trend = prediction.trend * i;
          return Math.min(100, Math.max(0, base + trend));
        }),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: number) => `${value}%`,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h3 className="font-medium text-white">
              Completion Rate
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white">
              {prediction.predictedCompletionRate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 text-sm">
              {prediction.trend > 0 ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              <span className={prediction.trend > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(prediction.trend * 100).toFixed(1)}% trend
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-green-400" />
            <h3 className="font-medium text-white">
              Predicted Streak
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white">
              {prediction.predictedStreak} days
            </div>
            <div className="text-sm text-gray-400">
              Next milestone: {prediction.nextMilestone} days
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-white">
              Confidence Score
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white">
              {prediction.confidence}%
            </div>
            <div className="text-sm text-gray-400">
              Based on historical data
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3D Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 rounded-xl p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <h3 className="font-medium text-white">
            Interactive Insights
          </h3>
        </div>
        <HabitVisualization data={visualizationData} />
      </motion.div>

      {/* Detailed Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="font-medium text-white">
            Detailed Statistics
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Time Distribution
            </h4>
            <div className="space-y-2">
              {Object.entries(prediction.detailedStats.timeDistribution).map(([time, count]) => (
                <div key={time} className="flex items-center gap-2">
                  <div className="text-sm text-gray-400 w-20">
                    {time}
                  </div>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full"
                      style={{ width: `${(count / Object.values(prediction.detailedStats.timeDistribution).reduce((a, b) => a + b, 0)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Weekly Performance
            </h4>
            <div className="space-y-2">
              {Object.entries(prediction.detailedStats.weekdayCompletion).map(([day, rate]) => (
                <div key={day} className="flex items-center gap-2">
                  <div className="text-sm text-gray-400 w-20">
                    {day}
                  </div>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-xl p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h3 className="font-medium text-white">
            30-Day Prediction
          </h3>
        </div>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Smart Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800 rounded-xl p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h3 className="font-medium text-white">
            Smart Suggestions
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-2 p-3 bg-gray-700 rounded-lg"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2" />
              <p className="text-sm text-gray-300">{suggestion}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};