import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Swords, Timer, Users, Trophy, Link, Play, Crown, Pause, Settings } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { useBattleStore } from '../../store/battleStore';
import toast from 'react-hot-toast';

interface HabitsBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BattleSettings {
  duration: number;
  stakes: 'friendly' | 'competitive' | 'hardcore';
  winCondition: 'firstToComplete' | 'mostCompleted' | 'highestStreak';
  maxParticipants: number;
}

export const HabitsBattleModal: React.FC<HabitsBattleModalProps> = ({ isOpen, onClose }) => {
  const habits = useHabitStore((state) => state.habits);
  const { createBattle, currentUserId } = useBattleStore();
  
  const [battleSettings, setBattleSettings] = useState<BattleSettings>({
    duration: 7,
    stakes: 'friendly',
    winCondition: 'mostCompleted',
    maxParticipants: 4
  });
  
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [showBattlePreview, setShowBattlePreview] = useState(false);

  const startBattle = () => {
    if (!currentUserId) {
      toast.error('You must be logged in to create a battle');
      return;
    }

    if (selectedHabits.length === 0) {
      toast.error('Please select at least one habit to battle with');
      return;
    }

    try {
      const selectedHabitsData = habits.filter(h => selectedHabits.includes(h.id));
      const battleId = createBattle(currentUserId, selectedHabitsData, battleSettings);
      
      // Get battle link
      const battleLink = `${window.location.origin}/battle/${battleId}`;
      
      // Copy battle link to clipboard
      navigator.clipboard.writeText(battleLink).then(() => {
        toast.success('Battle created! Link copied to clipboard');
      }).catch(() => {
        toast.success('Battle created! Share this link: ' + battleLink);
      });
      
      onClose();
    } catch (error) {
      console.error('Battle creation error:', error);
      toast.error('Failed to create battle. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Swords className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold dark:text-white">Create Habits Battle</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {!showBattlePreview ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Battle Duration
                </label>
                <div className="flex gap-2">
                  {[3, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setBattleSettings({ ...battleSettings, duration: days })}
                      className={`flex-1 py-2 px-3 rounded-lg border ${
                        battleSettings.duration === days
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Participants
                </label>
                <select
                  value={battleSettings.maxParticipants}
                  onChange={(e) => setBattleSettings({
                    ...battleSettings,
                    maxParticipants: Number(e.target.value)
                  })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  {[2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} players</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Win Condition
                </label>
                <select
                  value={battleSettings.winCondition}
                  onChange={(e) => setBattleSettings({
                    ...battleSettings,
                    winCondition: e.target.value as BattleSettings['winCondition']
                  })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="firstToComplete">First to Complete All</option>
                  <option value="mostCompleted">Most Habits Completed</option>
                  <option value="highestStreak">Highest Streak</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Battle Stakes
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'friendly', label: 'Friendly', icon: Users },
                    { value: 'competitive', label: 'Competitive', icon: Trophy },
                    { value: 'hardcore', label: 'Hardcore', icon: Crown },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setBattleSettings({
                        ...battleSettings,
                        stakes: value as BattleSettings['stakes']
                      })}
                      className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                        battleSettings.stakes === value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowBattlePreview(true)}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Next: Select Habits
              </button>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Select Battle Habits
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {habits.map((habit) => (
                    <label
                      key={habit.id}
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer
                               hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <input
                        type="checkbox"
                        checked={selectedHabits.includes(habit.id)}
                        onChange={() => {
                          setSelectedHabits(prev =>
                            prev.includes(habit.id)
                              ? prev.filter(id => id !== habit.id)
                              : [...prev, habit.id]
                          );
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-gray-900 dark:text-white">{habit.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBattlePreview(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200
                           dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  onClick={startBattle}
                  disabled={selectedHabits.length === 0}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Swords className="w-5 h-5" />
                  Create Battle
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};