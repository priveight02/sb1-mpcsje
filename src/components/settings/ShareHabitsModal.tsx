import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Eye, EyeOff, Link, Calendar, Download, X } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { useCalendarStore } from '../../store/calendarStore';
import toast from 'react-hot-toast';

interface ShareHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareHabitsModal: React.FC<ShareHabitsModalProps> = ({ isOpen, onClose }) => {
  const habits = useHabitStore((state) => state.habits);
  const scheduledTasks = useCalendarStore((state) => state.scheduledTasks);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [includeProgress, setIncludeProgress] = useState(true);
  const [includeCalendar, setIncludeCalendar] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const generateShareLink = () => {
    if (selectedHabits.length === 0) {
      toast.error('Please select at least one habit');
      return;
    }

    const selectedHabitsData = habits.filter(h => selectedHabits.includes(h.id));
    const relevantTasks = includeCalendar 
      ? scheduledTasks.filter(task => selectedHabits.includes(task.habitId))
      : [];

    const sharedData = {
      habits: selectedHabitsData.map(habit => ({
        ...habit,
        progress: includeProgress ? habit.progress : undefined,
        completedDates: includeProgress ? habit.completedDates : undefined,
      })),
      calendar: includeCalendar ? relevantTasks : undefined,
      sharedAt: new Date().toISOString(),
    };

    const encodedData = btoa(JSON.stringify(sharedData));
    const link = `${window.location.origin}/share?data=${encodedData}`;

    navigator.clipboard.writeText(link).then(() => {
      toast.success('Share link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const importSharedHabits = async () => {
    try {
      if (!shareLink) {
        toast.error('Please enter a share link');
        return;
      }

      const url = new URL(shareLink);
      const data = url.searchParams.get('data');
      if (!data) {
        toast.error('Invalid share link');
        return;
      }

      const sharedData = JSON.parse(atob(data));
      const addHabit = useHabitStore.getState().addHabit;
      const addTask = useCalendarStore.getState().addTask;

      for (const habit of sharedData.habits) {
        addHabit({
          title: habit.title,
          description: habit.description,
          icon: habit.icon,
          color: habit.color,
          frequency: habit.frequency,
          category: habit.category,
          progress: habit.progress,
        });

        if (sharedData.calendar) {
          const habitTasks = sharedData.calendar.filter(task => task.habitId === habit.id);
          habitTasks.forEach(task => {
            addTask({
              habitId: habit.id,
              date: task.date,
              reminder: task.reminder,
            });
          });
        }
      }

      toast.success('All habits imported successfully!');
      setShareLink('');
      setShowImport(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import habits');
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
                <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl font-semibold dark:text-white">
                  {showImport ? 'Import Habits' : 'Share Habits'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImport(!showImport)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {showImport ? <Share2 className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showImport ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paste Share Link
                  </label>
                  <input
                    type="text"
                    value={shareLink}
                    onChange={(e) => setShareLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                             focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="https://..."
                  />
                </div>
                <button
                  onClick={importSharedHabits}
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                  disabled={!shareLink}
                >
                  <Download className="w-5 h-5" />
                  Import Habits
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Select Habits to Share
                    </h3>
                    <button
                      onClick={() => setSelectedHabits(
                        selectedHabits.length === habits.length 
                          ? [] 
                          : habits.map(h => h.id)
                      )}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                    >
                      {selectedHabits.length === habits.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {habits.map(habit => (
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

                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Include Progress & Streaks
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeProgress}
                      onChange={(e) => setIncludeProgress(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <span className="block text-sm text-gray-700 dark:text-gray-300">
                          Include Calendar Events
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Share scheduled tasks and reminders
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeCalendar}
                      onChange={(e) => setIncludeCalendar(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>

                <button
                  onClick={generateShareLink}
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                  disabled={selectedHabits.length === 0}
                >
                  <Link className="w-5 h-5" />
                  Generate Share Link
                </button>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Only selected information will be shared
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};