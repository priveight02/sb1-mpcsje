import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Clock, Calendar as CalendarIcon, Trash2, Plus, 
  X, Moon, Sun, Brain, Activity, ChevronDown, AlarmClock
} from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { useHabitStore } from '../store/habitStore';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';
import { AnimatedCheckbox } from './shared/AnimatedCheckbox';
import toast from 'react-hot-toast';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { preferences, updatePreferences, addHabitSchedule, removeHabitSchedule, updateHabitSchedule } = useNotificationStore();
  const habits = useHabitStore((state) => state.habits);
  const [selectedHabit, setSelectedHabit] = useState('');
  const [showHabitScheduler, setShowHabitScheduler] = useState(false);
  const [alarmTime, setAlarmTime] = useState('09:00');

  const handleTimeChange = (time: string) => {
    updatePreferences({ reminderTime: time });
    toast.success('Reminder time updated');
  };

  const handleAddHabitSchedule = () => {
    const habit = habits.find(h => h.id === selectedHabit);
    if (!habit) {
      toast.error('Please select a habit');
      return;
    }

    addHabitSchedule({ 
      id: habit.id, 
      title: habit.title,
      alarmEnabled: true,
      alarmTime
    });
    setSelectedHabit('');
    setShowHabitScheduler(false);
    toast.success(`Schedule added for ${habit.title}`);
  };

  const handleToggleAlarm = (habitId: string, enabled: boolean) => {
    updateHabitSchedule(habitId, { alarmEnabled: enabled });
    toast.success(`Alarm ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleUpdateAlarmTime = (habitId: string, time: string) => {
    updateHabitSchedule(habitId, { alarmTime: time });
    toast.success('Alarm time updated');
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
                <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl font-semibold dark:text-white">Notification Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* General Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Enable Notifications
                    </span>
                  </div>
                  <Switch.Root
                    checked={preferences.enabled}
                    onCheckedChange={(checked) => {
                      updatePreferences({ enabled: checked });
                      if (checked) {
                        Notification.requestPermission();
                      }
                      toast.success(checked ? 'Notifications enabled' : 'Notifications disabled');
                    }}
                    className="w-11 h-6 bg-gray-200 rounded-full relative dark:bg-gray-700 
                             data-[state=checked]:bg-indigo-600"
                  >
                    <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform 
                                          duration-100 translate-x-1 data-[state=checked]:translate-x-6" />
                  </Switch.Root>
                </div>

                {preferences.enabled && (
                  <>
                    {/* Quiet Hours */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Quiet Hours
                          </span>
                        </div>
                        <Switch.Root
                          checked={preferences.quietHours.enabled}
                          onCheckedChange={(checked) => {
                            updatePreferences({
                              quietHours: { ...preferences.quietHours, enabled: checked }
                            });
                          }}
                          className="w-11 h-6 bg-gray-200 rounded-full relative dark:bg-gray-700 
                                   data-[state=checked]:bg-purple-600"
                        >
                          <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform 
                                                duration-100 translate-x-1 data-[state=checked]:translate-x-6" />
                        </Switch.Root>
                      </div>

                      {preferences.quietHours.enabled && (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Start
                            </label>
                            <input
                              type="time"
                              value={preferences.quietHours.start}
                              onChange={(e) => updatePreferences({
                                quietHours: { ...preferences.quietHours, start: e.target.value }
                              })}
                              className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border 
                                       border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                              End
                            </label>
                            <input
                              type="time"
                              value={preferences.quietHours.end}
                              onChange={(e) => updatePreferences({
                                quietHours: { ...preferences.quietHours, end: e.target.value }
                              })}
                              className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border 
                                       border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Habit Schedules */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Habit Schedules
                          </span>
                        </div>
                        <button
                          onClick={() => setShowHabitScheduler(true)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg 
                                   dark:hover:bg-blue-900/20"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {showHabitScheduler && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg z-10"
                          >
                            <select
                              value={selectedHabit}
                              onChange={(e) => setSelectedHabit(e.target.value)}
                              className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border 
                                       border-gray-300 dark:border-gray-600 rounded-lg"
                            >
                              <option value="">Select a habit</option>
                              {habits.map((habit) => (
                                <option key={habit.id} value={habit.id}>
                                  {habit.title}
                                </option>
                              ))}
                            </select>

                            <div>
                              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                                Alarm Time
                              </label>
                              <input
                                type="time"
                                value={alarmTime}
                                onChange={(e) => setAlarmTime(e.target.value)}
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border 
                                         border-gray-300 dark:border-gray-600 rounded-lg"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setShowHabitScheduler(false)}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-lg
                                         dark:text-gray-300 dark:hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleAddHabitSchedule}
                                disabled={!selectedHabit}
                                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg
                                         hover:bg-blue-600 disabled:opacity-50"
                              >
                                Add Schedule
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-2">
                        {preferences.habitSchedules.map((schedule) => (
                          <motion.div
                            key={schedule.habitId}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex items-center justify-between p-3 bg-gray-50 
                                     dark:bg-gray-700/50 rounded-lg"
                          >
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {schedule.habitTitle}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <AlarmClock className="w-4 h-4 text-gray-400" />
                                <input
                                  type="time"
                                  value={schedule.alarmTime}
                                  onChange={(e) => handleUpdateAlarmTime(schedule.habitId, e.target.value)}
                                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs"
                                />
                                <Switch.Root
                                  checked={schedule.alarmEnabled}
                                  onCheckedChange={(checked) => handleToggleAlarm(schedule.habitId, checked)}
                                  className="w-8 h-4 bg-gray-200 rounded-full relative dark:bg-gray-600 
                                           data-[state=checked]:bg-blue-500"
                                >
                                  <Switch.Thumb className="block w-3 h-3 bg-white rounded-full 
                                                        transition-transform duration-100 translate-x-0.5 
                                                        data-[state=checked]:translate-x-4" />
                                </Switch.Root>
                              </div>
                            </div>
                            <button
                              onClick={() => removeHabitSchedule(schedule.habitId)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg
                                       dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
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