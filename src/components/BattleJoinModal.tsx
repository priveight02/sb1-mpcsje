import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Swords } from 'lucide-react';
import { useBattleStore } from '../store/battleStore';
import { useHabitStore } from '../store/habitStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface BattleJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BattleJoinModal: React.FC<BattleJoinModalProps> = ({ isOpen, onClose }) => {
  const [battleId, setBattleId] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [step, setStep] = useState<'link' | 'habits'>('link');
  
  const habits = useHabitStore((state) => state.habits);
  const { joinBattle, getBattleById } = useBattleStore();
  const { user } = useAuthStore();

  const handleJoinBattle = () => {
    if (!user) {
      toast.error('Please sign in to join a battle');
      return;
    }

    try {
      // Extract battle ID from URL or direct input
      let extractedBattleId = battleId;
      if (battleId.includes('/')) {
        const parts = battleId.split('/');
        extractedBattleId = parts[parts.length - 1];
      }
      
      if (!extractedBattleId) {
        toast.error('Invalid battle link or ID');
        return;
      }

      const battle = getBattleById(extractedBattleId);
      if (!battle) {
        toast.error('Battle not found');
        return;
      }

      if (battle.status !== 'waiting' && !battle.settings.allowLateJoin) {
        toast.error('This battle has already started and does not allow late joining');
        return;
      }

      if (battle.participants.length >= battle.settings.maxParticipants) {
        toast.error('Battle is full');
        return;
      }

      if (selectedHabits.length === 0) {
        toast.error('Please select at least one habit');
        return;
      }

      joinBattle(extractedBattleId);
      toast.success('Successfully joined battle!');
      onClose();
    } catch (error) {
      console.error('Failed to join battle:', error);
      toast.error('Failed to join battle. Please check the link and try again.');
    }
  };

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
                <h2 className="text-xl font-semibold dark:text-white">Join Battle</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {step === 'link' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Battle Link or ID
                  </label>
                  <input
                    type="text"
                    value={battleId}
                    onChange={(e) => setBattleId(e.target.value)}
                    placeholder="Paste battle link or ID here..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={() => setStep('habits')}
                  disabled={!battleId}
                  className="w-full btn btn-primary"
                >
                  Next: Select Habits
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Habits to Battle With
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
                        <span className="ml-3 text-gray-900 dark:text-white">
                          {habit.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('link')}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg 
                             hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleJoinBattle}
                    disabled={selectedHabits.length === 0}
                    className="flex-1 btn btn-primary"
                  >
                    Join Battle
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};