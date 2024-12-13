import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Brain, Clock, Calendar, Settings, Activity, Sun, Moon, Target } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { useNotificationStore } from '../../store/notificationStore';
import { format, parseISO, differenceInMinutes, addDays, subDays } from 'date-fns';
import toast from 'react-hot-toast';

interface SmartRemindersProps {
  habitId: string;
}

interface TimeBlock {
  hour: number;
  successRate: number;
  completions: number;
  total: number;
}

interface DayAnalysis {
  day: number;
  successRate: number;
  bestTimeBlock: TimeBlock;
}

export const SmartReminders: React.FC<SmartRemindersProps> = ({ habitId }) => {
  const habit = useHabitStore((state) => state.habits.find(h => h.id === habitId));
  const { preferences, updatePreferences } = useNotificationStore();
  const [isEnabled, setIsEnabled] = useState(false);
  const [analysis, setAnalysis] = useState<{
    bestTime: string;
    bestDays: number[];
    timeBlocks: TimeBlock[];
    dayAnalysis: DayAnalysis[];
    consistency: number;
    adaptiveMode: boolean;
  }>({
    bestTime: '09:00',
    bestDays: [],
    timeBlocks: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      successRate: 0,
      completions: 0,
      total: 0
    })),
    dayAnalysis: [],
    consistency: 0,
    adaptiveMode: true
  });

  useEffect(() => {
    if (!habit) return;

    // Analyze completion patterns
    const completions = habit.completedDates
      .map(date => {
        try {
          return parseISO(date);
        } catch (e) {
          console.warn('Invalid date:', date);
          return null;
        }
      })
      .filter((date): date is Date => date !== null);

    const timeBlocks: TimeBlock[] = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      successRate: 0,
      completions: 0,
      total: 0
    }));

    const dayStats: Record<number, { success: number; total: number; times: number[] }> = {};
    const now = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => subDays(now, i));

    // Initialize day stats
    for (let i = 0; i < 7; i++) {
      dayStats[i] = { success: 0, total: 0, times: [] };
    }

    // Analyze each day in the last 30 days
    last30Days.forEach(date => {
      const day = date.getDay();
      dayStats[day].total++;

      // Find completion for this date
      const completion = completions.find(c => 
        c.getDate() === date.getDate() && 
        c.getMonth() === date.getMonth() &&
        c.getFullYear() === date.getFullYear()
      );

      if (completion) {
        dayStats[day].success++;
        const hour = completion.getHours();
        dayStats[day].times.push(hour);
        timeBlocks[hour].completions++;
        timeBlocks[hour].total++;
      }
    });

    // Calculate success rates
    timeBlocks.forEach(block => {
      block.successRate = block.total > 0 ? (block.completions / block.total) * 100 : 0;
    });

    // Find best performing days and times
    const dayAnalysis: DayAnalysis[] = Object.entries(dayStats).map(([day, stats]) => {
      const mostFrequentHour = stats.times.length > 0 
        ? stats.times.reduce((a, b, i, arr) => 
            arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
          , stats.times[0])
        : 9; // Default to 9 AM if no data

      return {
        day: Number(day),
        successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
        bestTimeBlock: timeBlocks[mostFrequentHour]
      };
    });

    // Sort by success rate
    dayAnalysis.sort((a, b) => b.successRate - a.successRate);

    // Calculate best time based on highest success rate
    const bestTimeBlock = timeBlocks.reduce((a, b) => 
      b.successRate > a.successRate ? b : a
    , timeBlocks[9]); // Default to 9 AM if no clear winner

    // Calculate consistency
    const consistency = completions.length / 30 * 100;

    setAnalysis({
      bestTime: `${bestTimeBlock.hour.toString().padStart(2, '0')}:00`,
      bestDays: dayAnalysis.slice(0, 3).map(d => d.day),
      timeBlocks,
      dayAnalysis,
      consistency,
      adaptiveMode: true
    });

    // Check if reminders are already enabled
    const existingSchedule = preferences.habitSchedules.find(s => s.habitId === habitId);
    setIsEnabled(!!existingSchedule?.enabled);
  }, [habit, preferences.habitSchedules]);

  const handleToggleReminders = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);

    if (newEnabled) {
      updatePreferences({
        habitSchedules: [
          ...preferences.habitSchedules.filter(s => s.habitId !== habitId),
          {
            habitId,
            habitTitle: habit?.title || '',
            enabled: true,
            alarmEnabled: true,
            alarmTime: analysis.bestTime,
            schedule: {
              type: 'smart',
              time: analysis.bestTime,
              days: analysis.bestDays,
              adaptiveMode: analysis.adaptiveMode
            }
          }
        ]
      });
      toast.success('Smart reminders enabled');
    } else {
      updatePreferences({
        habitSchedules: preferences.habitSchedules.filter(s => s.habitId !== habitId)
      });
      toast.success('Smart reminders disabled');
    }
  };

  const getBestTimeSuccessRate = () => {
    const hour = parseInt(analysis.bestTime);
    const block = analysis.timeBlocks.find(b => b.hour === hour);
    return block ? Math.round(block.successRate) : 0;
  };

  return (
    <div className="bg-gray-700/50 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <h3 className="font-medium text-white">Smart Reminders</h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleReminders}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm ${
            isEnabled
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-600/50 text-gray-400'
          }`}
        >
          <Bell className="w-4 h-4" />
          {isEnabled ? 'Enabled' : 'Disabled'}
        </motion.button>
      </div>

      {/* Success Rate Timeline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>Daily Success Rate</span>
          <span>{Math.round(analysis.consistency)}%</span>
        </div>
        <div className="flex gap-1">
          {analysis.timeBlocks.map((block, i) => (
            <div
              key={i}
              className="flex-1 h-16 relative group"
              style={{ opacity: 0.3 + (block.successRate / 100) * 0.7 }}
            >
              <div
                className="absolute bottom-0 w-full bg-indigo-500 rounded-sm transition-all"
                style={{ height: `${block.successRate}%` }}
              />
              <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 
                           bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {block.hour}:00 - {block.successRate.toFixed(1)}% success
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>12 AM</span>
          <span>12 PM</span>
          <span>11 PM</span>
        </div>
      </div>

      {/* Best Times */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Sun className="w-4 h-4" />
            <span>Peak Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={analysis.bestTime}
              readOnly
              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm"
            />
            <div className="text-xs text-green-400">
              {getBestTimeSuccessRate()}% success
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Target className="w-4 h-4" />
            <span>Best Days</span>
          </div>
          <div className="flex gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  analysis.bestDays.includes(index)
                    ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/50'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      {isEnabled && (
        <div className="pt-3 border-t border-gray-600 space-y-3">
          <label className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="text-gray-300">Adaptive Mode</span>
            </div>
            <input
              type="checkbox"
              checked={analysis.adaptiveMode}
              onChange={(e) => setAnalysis(prev => ({ ...prev, adaptiveMode: e.target.checked }))}
              className="rounded text-indigo-600 bg-gray-600 border-gray-500"
            />
          </label>
          <p className="text-xs text-gray-400">
            Automatically adjusts reminder times based on your performance patterns
          </p>
        </div>
      )}
    </div>
  );
};