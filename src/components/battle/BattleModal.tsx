import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Timer, Users, Trophy, Link, Play, Crown, Pause, Settings } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { useBattleStore } from '../../store/battleStore';
import { useAuthStore } from '../../store/authStore';
import { usePremiumStore } from '../../store/premiumStore';
import { BattleControlPanel } from './BattleControlPanel';
import { BattleLimitToast } from './BattleLimitToast';
import toast from 'react-hot-toast';

interface BattleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BattleModal: React.FC<BattleModalProps> = ({ isOpen, onClose }) => {
  const habits = useHabitStore((state) => state.habits);
  const { user } = useAuthStore();
  const createBattle = useBattleStore((state) => state.createBattle);
  const weeklyBattleCreations = useBattleStore((state) => state.weeklyBattleCreations);
  const { hasFeature, isFeatureEnabled } = usePremiumStore();
  
  const [battleSettings, setBattleSettings] = useState({
    duration: 7,
    stakes: 'friendly' as const,
    winCondition: 'mostCompleted' as const,
    maxParticipants: 4,
    allowLateJoin: false,
    requireVerification: false,
    autoEnd: true
  });
  
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [battleTitle, setBattleTitle] = useState('');
  const [showHabitSelection, setShowHabitSelection] = useState(false);
  const [createdBattleId, setCreatedBattleId] = useState<string | null>(null);

  const hasUnlimitedBattles = hasFeature('unlimited_battles') && isFeatureEnabled('unlimited_battles');
  const weeklyBattlesLeft = hasUnlimitedBattles ? '∞' : Math.max(0, 2 - weeklyBattleCreations.count);

  const handleCreateBattle = () => {
    if (!user) {
      toast.error('Please sign in to create a battle');
      return;
    }

    if (!battleTitle.trim()) {
      toast.error('Please enter a battle title');
      return;
    }

    if (selectedHabits.length === 0) {
      toast.error('Please select at least one habit');
      return;
    }

    try {
      const battleId = createBattle(battleTitle, battleSettings);
      setCreatedBattleId(battleId);
      
      // Show battle control panel
      const battleLink = `${window.location.origin}/battle/${battleId}`;
      
      // Copy link to clipboard
      navigator.clipboard.writeText(battleLink).then(() => {
        toast.success('Battle created! Link copied to clipboard');
        
        // Show remaining battles notification for non-premium users
        if (!hasUnlimitedBattles) {
          const remainingBattles = 2 - (weeklyBattleCreations.count + 1);
          if (remainingBattles === 0) {
            toast((t) => (
              <BattleLimitToast
                type="limit"
                onStoreClick={() => {
                  onClose();
                  window.location.hash = '#store';
                }}
                onDismiss={() => toast.dismiss(t.id)}
              />
            ), {
              duration: 5000,
              position: 'top-center'
            });
          } else {
            toast.info(`${remainingBattles} weekly battle${remainingBattles === 1 ? '' : 's'} remaining`);
          }
        }
      }).catch(() => {
        toast.success('Battle created! Share this link: ' + battleLink);
      });
    } catch (error: any) {
      console.error('Battle creation error:', error);
      if (error.message === 'Weekly battle limit reached') {
        toast((t) => (
          <BattleLimitToast
            type="limit"
            onStoreClick={() => {
              onClose();
              window.location.hash = '#store';
            }}
            onDismiss={() => toast.dismiss(t.id)}
          />
        ), {
          duration: 5000,
          position: 'top-center'
        });
      } else {
        toast.error(error.message || 'Failed to create battle');
      }
    }
  };

  if (createdBattleId) {
    return (
      <BattleControlPanel
        battleId={createdBattleId}
        onClose={() => {
          setCreatedBattleId(null);
          setShowHabitSelection(false);
          setBattleTitle('');
          setSelectedHabits([]);
          onClose();
        }}
      />
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Swords className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">Create Battle</h2>
                  {!hasUnlimitedBattles && (
                    <p className="text-sm text-gray-400">
                      {weeklyBattlesLeft} battle{weeklyBattlesLeft !== 1 ? 's' : ''} remaining this week
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {!showHabitSelection ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Battle Title
                  </label>
                  <input
                    type="text"
                    value={battleTitle}
                    onChange={(e) => setBattleTitle(e.target.value)}
                    placeholder="Enter battle title..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Battle Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 7, 14, 30].map((days) => (
                      <button
                        key={days}
                        onClick={() => setBattleSettings({ ...battleSettings, duration: days })}
                        className={`py-2 px-3 rounded-lg border ${
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
                      winCondition: e.target.value as typeof battleSettings.winCondition
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
                          stakes: value as typeof battleSettings.stakes
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

                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Allow Late Join</span>
                    <input
                      type="checkbox"
                      checked={battleSettings.allowLateJoin}
                      onChange={(e) => setBattleSettings({
                        ...battleSettings,
                        allowLateJoin: e.target.checked
                      })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto-End Battle</span>
                    <input
                      type="checkbox"
                      checked={battleSettings.autoEnd}
                      onChange={(e) => setBattleSettings({
                        ...battleSettings,
                        autoEnd: e.target.checked
                      })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>

                <button
                  onClick={() => setShowHabitSelection(true)}
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Next: Select Habits
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Select Battle Habits
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {habits.map((habit) => (
                      <label
                        key={habit.id}
                        className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg 
                                 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <input
                          type="checkbox"
                          checked={selectedHabits.includes(habit.id)}
                          onChange={(e) => {
                            setSelectedHabits(prev =>
                              e.target.checked
                                ? [...prev, habit.id]
                                : prev.filter(id => id !== habit.id)
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
                    onClick={() => setShowHabitSelection(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200
                             dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateBattle}
                    disabled={selectedHabits.length === 0}
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  >
                    <Swords className="w-5 h-5" />
                    Create Battle
                  </button>
                </div>
              </div>
            )}

            {/* Premium Upgrade Notice */}
            {!hasUnlimitedBattles && weeklyBattlesLeft === 0 && (
              <div className="mt-4 p-4 bg-indigo-600/20 rounded-lg">
                <p className="text-sm text-indigo-400">
                  You've reached your weekly battle limit. Upgrade to Premium for unlimited battles!
                </p>
                <button
                  onClick={() => {
                    onClose();
                    window.location.hash = '#store';
                  }}
                  className="mt-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
                >
                  View Premium Features
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};