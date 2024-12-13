import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Trash2, Target, Activity, Calendar, Brain, Percent } from 'lucide-react';
import { Habit } from '../types/habit';
import { useHabitStore } from '../store/habitStore';
import { PremiumFeatureWrapper } from './premium/PremiumFeatureWrapper';
import { ExtendedHistory } from './premium/ExtendedHistory';
import { SmartReminders } from './premium/SmartReminders';
import { usePremiumFeatures } from '../hooks/usePremiumFeatures';
import toast from 'react-hot-toast';

interface HabitPropertiesProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
}

export const HabitProperties: React.FC<HabitPropertiesProps> = ({ habit, isOpen, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: habit.title,
    description: habit.description || '',
    icon: habit.icon,
    color: habit.color,
    progress: habit.progress ? { current: habit.progress.current } : null,
  });

  const { updateHabit, deleteHabit } = useHabitStore();
  const { hasAdvancedAnalytics, hasSmartReminders } = usePremiumFeatures();

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    // Validate progress if set
    if (formData.progress && (formData.progress.current < 0 || formData.progress.current > 100)) {
      toast.error('Progress must be between 0 and 100');
      return;
    }

    updateHabit(habit.id, formData);
    toast.success('Habit updated successfully!');
    setEditMode(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      deleteHabit(habit.id);
      toast.success('Habit deleted successfully!');
      onClose();
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
            className="bg-gray-800 rounded-xl w-full max-w-lg overflow-hidden max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">
                  {editMode ? 'Edit Habit' : 'Habit Properties'}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4 max-w-md mx-auto">
                {editMode ? (
                  // Edit Form
                  <div className="space-y-4">
                    {/* Basic Form Fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        rows={2}
                      />
                    </div>

                    {/* Progress Input */}
                    <div>
                      <label className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm font-medium text-gray-300">Progress</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={!!formData.progress}
                          onChange={(e) => setFormData({
                            ...formData,
                            progress: e.target.checked ? { current: 0 } : null
                          })}
                          className="rounded text-indigo-600"
                        />
                      </label>
                      
                      {formData.progress && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={formData.progress.current}
                              onChange={(e) => setFormData({
                                ...formData,
                                progress: { current: Math.min(100, Math.max(0, Number(e.target.value))) }
                              })}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                            <span className="text-gray-400">%</span>
                          </div>
                          <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 transition-all duration-300"
                              style={{ width: `${formData.progress.current}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-4">
                    {/* Basic Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-indigo-400" />
                          <h3 className="font-medium text-white text-sm">Current Streak</h3>
                        </div>
                        <p className="text-xl font-bold text-white">{habit.streak} days</p>
                      </div>

                      <div className="p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <h3 className="font-medium text-white text-sm">Total Completions</h3>
                        </div>
                        <p className="text-xl font-bold text-white">{habit.completedDates.length}</p>
                      </div>
                    </div>

                    {/* Progress Display */}
                    {habit.progress && (
                      <div className="p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Percent className="w-4 h-4 text-indigo-400" />
                          <h3 className="font-medium text-white text-sm">Current Progress</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl font-bold text-white">{habit.progress.current}%</span>
                        </div>
                        <div className="bg-gray-600 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${habit.progress.current}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Premium Features */}
                    <div className="space-y-3">
                      {/* Smart Reminders (Premium) */}
                      <PremiumFeatureWrapper
                        featureId="smart_reminders"
                        fallback={
                          <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="w-4 h-4 text-indigo-400" />
                              <h3 className="font-medium text-white text-sm">Smart Reminders</h3>
                            </div>
                            <p className="text-xs text-gray-400">Get AI-powered reminder suggestions</p>
                          </div>
                        }
                      >
                        <SmartReminders habitId={habit.id} />
                      </PremiumFeatureWrapper>

                      {/* Advanced Analytics (Premium) */}
                      <PremiumFeatureWrapper
                        featureId="advanced_analytics"
                        fallback={
                          <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="w-4 h-4 text-indigo-400" />
                              <h3 className="font-medium text-white text-sm">Advanced Analytics</h3>
                            </div>
                            <p className="text-xs text-gray-400">Unlock detailed analytics and insights</p>
                          </div>
                        }
                      >
                        <ExtendedHistory habitId={habit.id} completedDates={habit.completedDates} />
                      </PremiumFeatureWrapper>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex-shrink-0">
              <div className="flex justify-between gap-3">
                {editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex-1"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex-1"
                    >
                      <Edit2 size={16} className="inline-block mr-2" />
                      Edit Habit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg flex-1"
                    >
                      <Trash2 size={16} className="inline-block mr-2" />
                      Delete Habit
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};