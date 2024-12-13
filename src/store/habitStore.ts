import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, parseISO, isSameDay, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';
import { Habit } from '../types/habit';
import { createNotesSlice, NotesSlice } from './notesSlice';
import { useTaskStore } from './taskStore';
import { sendNotification } from '../utils/notifications';

function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  
  const sortedDates = [...completedDates]
    .sort((a, b) => parseISO(b).getTime() - parseISO(a).getTime());
  
  let streak = 0;
  let currentDate = new Date();
  
  if (!completedDates.some(date => isSameDay(parseISO(date), currentDate))) {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  for (const date of sortedDates) {
    const completedDate = parseISO(date);
    if (isSameDay(currentDate, completedDate)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateConsistency(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const firstDate = parseISO(completedDates[0]);
  const lastDate = new Date();
  const totalDays = differenceInDays(lastDate, firstDate) + 1;
  const uniqueDates = new Set(completedDates.map(date => 
    format(parseISO(date), 'yyyy-MM-dd')
  )).size;

  return Math.round((uniqueDates / totalDays) * 100);
}

function analyzeProductiveTime(completedDates: string[]): { day: number; time: string } {
  const dayCount = new Array(7).fill(0);
  const hourCount = new Array(24).fill(0);

  completedDates.forEach(date => {
    const dateObj = parseISO(date);
    dayCount[dateObj.getDay()]++;
    hourCount[dateObj.getHours()]++;
  });

  const mostProductiveDay = dayCount.indexOf(Math.max(...dayCount));
  const mostProductiveHour = hourCount.indexOf(Math.max(...hourCount));

  return {
    day: mostProductiveDay,
    time: `${mostProductiveHour.toString().padStart(2, '0')}:00`
  };
}

export interface HabitStore extends NotesSlice {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'streak' | 'analytics'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  toggleHabit: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
  clearAllData: () => void;
  getWeeklyProgress: (habitId: string) => { date: string; completed: boolean }[];
  updateAnalytics: (habitId: string) => void;
  checkScheduledReminders: () => void;
  startChallenge: (habitId: string, challenge: { name: string; target: number; days: number }) => void;
  completeChallenge: (habitId: string) => void;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      
      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habit,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              completedDates: [],
              streak: 0,
              notes: [],
              analytics: {
                bestStreak: 0,
                totalCompletions: 0,
                consistency: 0
              }
            },
          ],
        })),

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updates } : habit
          ),
        })),

      toggleHabit: (id, date) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;
            
            const wasCompleted = habit.completedDates.includes(date);
            const completedDates = wasCompleted
              ? habit.completedDates.filter((d) => d !== date)
              : [...habit.completedDates, date];
            
            const newStreak = calculateStreak(completedDates);
            const bestStreak = Math.max(newStreak, habit.analytics?.bestStreak || 0);
            
            // Update analytics
            const analytics = {
              ...habit.analytics,
              bestStreak,
              totalCompletions: completedDates.length,
              consistency: calculateConsistency(completedDates),
              ...analyzeProductiveTime(completedDates)
            };

            // Check if challenge is completed
            let challenges = habit.challenges;
            if (challenges?.current && !wasCompleted) {
              const progress = challenges.current.progress + 1;
              if (progress >= challenges.current.target) {
                challenges = {
                  completed: [
                    ...(challenges.completed || []),
                    {
                      id: challenges.current.id,
                      name: challenges.current.name,
                      completedDate: new Date().toISOString()
                    }
                  ]
                };
                sendNotification('Challenge Completed! 🎉', {
                  body: `Congratulations! You've completed the "${challenges.current.name}" challenge!`
                });
              } else {
                challenges = {
                  ...challenges,
                  current: {
                    ...challenges.current,
                    progress
                  }
                };
              }
            }

            return {
              ...habit,
              completedDates,
              streak: newStreak,
              analytics,
              challenges
            };
          }),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),

      clearAllData: () => set({ habits: [] }),

      getWeeklyProgress: (habitId) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return [];

        const start = startOfWeek(new Date());
        const end = endOfWeek(new Date());
        const days: { date: string; completed: boolean }[] = [];

        for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
          const dateStr = format(day, 'yyyy-MM-dd');
          days.push({
            date: dateStr,
            completed: habit.completedDates.includes(dateStr)
          });
        }

        return days;
      },

      updateAnalytics: (habitId) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit;

            const analytics = {
              ...habit.analytics,
              consistency: calculateConsistency(habit.completedDates),
              ...analyzeProductiveTime(habit.completedDates)
            };

            return { ...habit, analytics };
          })
        }));
      },

      checkScheduledReminders: () => {
        const now = new Date();
        const habits = get().habits;

        habits.forEach(habit => {
          if (!habit.schedule?.reminder.enabled) return;

          habit.schedule.reminder.times.forEach(time => {
            const [hours, minutes] = time.split(':').map(Number);
            const reminderTime = new Date();
            reminderTime.setHours(hours, minutes, 0);

            const notifyBeforeMs = (habit.schedule?.reminder.notifyBefore || 0) * 60 * 1000;
            const shouldNotifyTime = new Date(reminderTime.getTime() - notifyBeforeMs);

            if (shouldNotifyTime <= now && shouldNotifyTime >= new Date(now.getTime() - 60000)) {
              sendNotification(`Habit Reminder: ${habit.title}`, {
                body: 'Time to maintain your streak!',
                tag: `habit-${habit.id}`,
                renotify: true
              });
            }
          });
        });
      },

      startChallenge: (habitId, challenge) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit;

            return {
              ...habit,
              challenges: {
                ...habit.challenges,
                current: {
                  id: crypto.randomUUID(),
                  name: challenge.name,
                  target: challenge.target,
                  progress: 0,
                  endDate: format(
                    new Date(Date.now() + challenge.days * 24 * 60 * 60 * 1000),
                    'yyyy-MM-dd'
                  )
                }
              }
            };
          })
        }));
      },

      completeChallenge: (habitId) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId || !habit.challenges?.current) return habit;

            return {
              ...habit,
              challenges: {
                completed: [
                  ...(habit.challenges.completed || []),
                  {
                    id: habit.challenges.current.id,
                    name: habit.challenges.current.name,
                    completedDate: new Date().toISOString()
                  }
                ]
              }
            };
          })
        }));
      },

      ...createNotesSlice(set, get),
    }),
    {
      name: 'habits-storage',
    }
  )
);