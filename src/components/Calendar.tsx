import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bell, Plus, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
         isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { useHabitStore } from '../store/habitStore';
import { useCalendarStore, type ScheduledTask } from '../store/calendarStore';
import { useNotificationStore } from '../store/notificationStore';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);

  const { habits } = useHabitStore();
  const { scheduledTasks, addTaskToMultipleDates, updateTask, removeTask } = useCalendarStore();
  const notificationEnabled = useNotificationStore((state) => state.preferences.enabled);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Check for due reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      scheduledTasks.forEach((task) => {
        if (
          task.reminder.enabled &&
          !task.reminder.notified &&
          isSameDay(parseISO(task.date), now)
        ) {
          const [hours, minutes] = task.reminder.time.split(':');
          const reminderTime = new Date();
          reminderTime.setHours(parseInt(hours), parseInt(minutes), 0);

          if (now >= reminderTime) {
            const habit = habits.find((h) => h.id === task.habitId);
            if (habit) {
              sendNotification(`Reminder: ${habit.title}`, {
                body: `It's time for your scheduled habit!`,
              });
              updateTask(task.id, {
                reminder: { ...task.reminder, notified: true },
              });
            }
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [scheduledTasks, habits]);

  const handleDragStart = (habitId: string) => {
    setDraggedHabitId(habitId);
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (!selectedDates.some((d) => isSameDay(d, date))) {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleDrop = () => {
    if (draggedHabitId && selectedDates.length > 0) {
      addTaskToMultipleDates(
        draggedHabitId,
        selectedDates.map((date) => date.toISOString())
      );
      toast.success('Tasks scheduled successfully!');
    }
    setDraggedHabitId(null);
    setSelectedDates([]);
  };

  const TaskModal: React.FC<{ task: ScheduledTask }> = ({ task }) => {
    const habit = habits.find((h) => h.id === task.habitId);
    if (!habit) return null;

    return (
      <Dialog.Root open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-semibold dark:text-white">
                Task Details
              </Dialog.Title>
              <Dialog.Close className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <X size={20} />
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{habit.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(parseISO(task.date), 'MMMM d, yyyy')}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reminder
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified when it's time
                  </p>
                </div>
                <Switch.Root
                  checked={task.reminder.enabled}
                  onCheckedChange={(checked) => {
                    if (!notificationEnabled) {
                      toast.error('Please enable notifications in settings first');
                      return;
                    }
                    updateTask(task.id, {
                      reminder: { ...task.reminder, enabled: checked },
                    });
                  }}
                  className="w-11 h-6 bg-gray-200 rounded-full relative dark:bg-gray-700 data-[state=checked]:bg-indigo-600"
                >
                  <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 translate-x-1 data-[state=checked]:translate-x-6" />
                </Switch.Root>
              </div>

              {task.reminder.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    value={task.reminder.time}
                    onChange={(e) =>
                      updateTask(task.id, {
                        reminder: { ...task.reminder, time: e.target.value },
                      })
                    }
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              )}

              <button
                onClick={() => {
                  removeTask(task.id);
                  setIsTaskModalOpen(false);
                  toast.success('Task removed');
                }}
                className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Remove Task
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pb-24 max-w-3xl mx-auto"
    >
      <div className="sticky top-0 bg-white dark:bg-gray-900 pt-8 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px">
          {monthDays.map((day) => {
            const dayTasks = scheduledTasks.filter((task) =>
              isSameDay(parseISO(task.date), day)
            );
            
            return (
              <div
                key={day.toISOString()}
                className={clsx(
                  'min-h-[120px] p-2 transition-colors',
                  isToday(day) && 'bg-blue-50 dark:bg-blue-900/20',
                  !isSameMonth(day, currentDate) && 'bg-gray-50 dark:bg-gray-900',
                  selectedDates.some((d) => isSameDay(d, day)) && 'bg-indigo-50 dark:bg-indigo-900/20'
                )}
                onDragOver={(e) => handleDragOver(e, day)}
                onDrop={handleDrop}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={clsx(
                      'text-sm font-medium',
                      isToday(day) && 'text-blue-600 dark:text-blue-400',
                      !isSameMonth(day, currentDate) && 'text-gray-400 dark:text-gray-600'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayTasks.map((task) => {
                    const habit = habits.find((h) => h.id === task.habitId);
                    if (!habit) return null;

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded cursor-pointer transition-colors"
                        style={{
                          backgroundColor: `${habit.color}20`,
                          color: habit.color,
                        }}
                      >
                        {task.reminder.enabled && (
                          <Bell size={12} className="shrink-0" />
                        )}
                        <span className="truncate">{habit.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Drag habits to schedule
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {habits.map((habit) => (
            <div
              key={habit.id}
              draggable
              onDragStart={() => handleDragStart(habit.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: habit.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {habit.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedTask && <TaskModal task={selectedTask} />}
    </motion.div>
  );
};