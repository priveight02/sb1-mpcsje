import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendNotification } from '../utils/notifications';

export interface ScheduledTask {
  id: string;
  habitId: string;
  date: string;
  reminder: {
    enabled: boolean;
    time: string;
    notified: boolean;
  };
}

interface CalendarStore {
  scheduledTasks: ScheduledTask[];
  addTask: (task: Omit<ScheduledTask, 'id'>) => void;
  removeTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<ScheduledTask>) => void;
  addTaskToMultipleDates: (habitId: string, dates: string[]) => void;
  markNotified: (taskId: string) => void;
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      scheduledTasks: [],
      addTask: (task) =>
        set((state) => ({
          scheduledTasks: [
            ...state.scheduledTasks,
            { ...task, id: crypto.randomUUID() },
          ],
        })),
      removeTask: (taskId) =>
        set((state) => ({
          scheduledTasks: state.scheduledTasks.filter((task) => task.id !== taskId),
        })),
      updateTask: (taskId, updates) =>
        set((state) => ({
          scheduledTasks: state.scheduledTasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        })),
      addTaskToMultipleDates: (habitId, dates) =>
        set((state) => ({
          scheduledTasks: [
            ...state.scheduledTasks,
            ...dates.map((date) => ({
              id: crypto.randomUUID(),
              habitId,
              date,
              reminder: {
                enabled: false,
                time: '09:00',
                notified: false,
              },
            })),
          ],
        })),
      markNotified: (taskId) =>
        set((state) => ({
          scheduledTasks: state.scheduledTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  reminder: { ...task.reminder, notified: true },
                }
              : task
          ),
        })),
    }),
    {
      name: 'calendar-storage',
    }
  )
);