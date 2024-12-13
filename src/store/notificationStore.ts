import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HabitSchedule {
  habitId: string;
  habitTitle: string;
  enabled: boolean;
  alarmEnabled: boolean;
  alarmTime: string;
  schedule: {
    type: 'daily' | 'weekly' | 'custom';
    time: string;
    days?: number[]; // 0-6 for weekly
    dates?: string[]; // ISO strings for custom dates
    repeat?: boolean;
  };
  lastNotified?: string;
}

interface NotificationPreferences {
  enabled: boolean;
  habitCompletion: boolean;
  streakMilestones: boolean;
  dailyReminders: boolean;
  reminderTime: string;
  habitSchedules: HabitSchedule[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  smartReminders: {
    enabled: boolean;
    adaptToActivity: boolean;
    minimumInterval: number; // minutes
  };
}

interface NotificationStore {
  preferences: NotificationPreferences;
  permissionGranted: boolean;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  setPermissionGranted: (granted: boolean) => void;
  updateHabitSchedule: (habitId: string, updates: Partial<HabitSchedule>) => void;
  addHabitSchedule: (habit: { id: string; title: string; alarmEnabled?: boolean; alarmTime?: string }) => void;
  removeHabitSchedule: (habitId: string) => void;
}

const defaultPreferences: NotificationPreferences = {
  enabled: false,
  habitCompletion: true,
  streakMilestones: true,
  dailyReminders: false,
  reminderTime: '09:00',
  habitSchedules: [],
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00'
  },
  smartReminders: {
    enabled: true,
    adaptToActivity: true,
    minimumInterval: 30
  }
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,
      permissionGranted: false,

      updatePreferences: (updates) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        })),

      setPermissionGranted: (granted) =>
        set({ permissionGranted: granted }),

      updateHabitSchedule: (habitId, updates) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            habitSchedules: state.preferences.habitSchedules.map(schedule =>
              schedule.habitId === habitId
                ? { ...schedule, ...updates }
                : schedule
            )
          }
        })),

      addHabitSchedule: (habit) =>
        set((state) => {
          if (state.preferences.habitSchedules.some(s => s.habitId === habit.id)) {
            return state;
          }
          return {
            preferences: {
              ...state.preferences,
              habitSchedules: [
                ...state.preferences.habitSchedules,
                {
                  habitId: habit.id,
                  habitTitle: habit.title,
                  enabled: true,
                  alarmEnabled: habit.alarmEnabled || false,
                  alarmTime: habit.alarmTime || '09:00',
                  schedule: {
                    type: 'daily',
                    time: '09:00'
                  }
                }
              ]
            }
          };
        }),

      removeHabitSchedule: (habitId) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            habitSchedules: state.preferences.habitSchedules.filter(
              schedule => schedule.habitId !== habitId
            )
          }
        })),
    }),
    {
      name: 'notification-storage',
      storage: localStorage,
    }
  )
);