import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useHabitStore } from './habitStore';
import { useAuthStore } from './authStore';
import { format, subDays, parseISO } from 'date-fns';

interface LeaderboardUser {
  id: string;
  username: string;
  streak: number;
  points: number;
  completionRate: number;
  lastActive: string;
  totalHabits: number;
  totalCompletions: number;
  rank: {
    current: number;
    previous: number;
    change: number;
  };
  achievements: string[];
  isGuest?: boolean;
  guestNumber?: number;
  photoURL?: string;
}

interface LeaderboardStore {
  users: LeaderboardUser[];
  lastSync: string | null;
  isSyncing: boolean;
  guestCounter: number;
  addPoints: (userId: string, points: number, isGuest?: boolean) => void;
  addOrUpdateUser: (userData: Partial<LeaderboardUser>) => void;
  removeInactiveUsers: () => void;
  getLeaderboard: (timeframe: 'weekly' | 'monthly' | 'allTime') => LeaderboardUser[];
  updateUserStats: () => void;
  calculateUserRank: (userId: string) => number;
  syncLeaderboard: () => Promise<void>;
  startAutoSync: () => void;
  stopAutoSync: () => void;
}

let syncInterval: NodeJS.Timeout | null = null;

export const useLeaderboardStore = create<LeaderboardStore>()(
  persist(
    (set, get) => ({
      users: [],
      lastSync: null,
      isSyncing: false,
      guestCounter: 0,

      addPoints: (userId, points, isGuest = false) => {
        set((state) => {
          const userIdToUpdate = isGuest ? 'guest' : userId;
          const existingUser = state.users.find(u => u.id === userIdToUpdate);

          if (!existingUser && isGuest) {
            // Create new guest user if doesn't exist
            const guestNumber = state.guestCounter + 1;
            return {
              users: [...state.users, {
                id: userIdToUpdate,
                username: `Guest ${guestNumber}`,
                streak: 0,
                points: points,
                completionRate: 0,
                lastActive: new Date().toISOString(),
                totalHabits: 0,
                totalCompletions: 0,
                rank: {
                  current: state.users.length + 1,
                  previous: state.users.length + 1,
                  change: 0,
                },
                achievements: [],
                isGuest: true,
                guestNumber,
              }],
              guestCounter: guestNumber,
            };
          }

          return {
            users: state.users.map((user) =>
              user.id === userIdToUpdate
                ? { ...user, points: user.points + points }
                : user
            ),
          };
        });
        get().syncLeaderboard();
      },

      addOrUpdateUser: (userData) => {
        set((state) => {
          const userIdToUse = userData.isGuest ? 'guest' : userData.id;
          const existingUserIndex = state.users.findIndex(
            (user) => user.id === userIdToUse
          );

          const updatedUsers = [...state.users];
          if (existingUserIndex >= 0) {
            const previousRank = state.users[existingUserIndex].rank?.current || 0;
            const currentRank = get().calculateUserRank(userIdToUse);
            
            updatedUsers[existingUserIndex] = {
              ...updatedUsers[existingUserIndex],
              ...userData,
              id: userIdToUse,
              rank: {
                current: currentRank,
                previous: previousRank,
                change: previousRank - currentRank,
              },
              lastActive: new Date().toISOString(),
            };
          } else {
            const currentRank = state.users.length + 1;
            const guestNumber = userData.isGuest ? state.guestCounter + 1 : undefined;
            
            updatedUsers.push({
              id: userIdToUse,
              username: userData.isGuest ? `Guest ${guestNumber}` : userData.username || `User${state.users.length + 1}`,
              streak: 0,
              points: 0,
              completionRate: 0,
              lastActive: new Date().toISOString(),
              totalHabits: 0,
              totalCompletions: 0,
              rank: {
                current: currentRank,
                previous: currentRank,
                change: 0,
              },
              achievements: [],
              isGuest: userData.isGuest,
              guestNumber,
              ...userData,
            });

            if (userData.isGuest) {
              set({ guestCounter: guestNumber || state.guestCounter });
            }
          }

          // Sort users by points and update ranks
          updatedUsers.sort((a, b) => b.points - a.points);
          updatedUsers.forEach((user, index) => {
            user.rank.previous = user.rank.current;
            user.rank.current = index + 1;
            user.rank.change = user.rank.previous - user.rank.current;
          });

          return { users: updatedUsers };
        });

        get().syncLeaderboard();
      },

      removeInactiveUsers: () => {
        set((state) => {
          const thirtyDaysAgo = subDays(new Date(), 30);
          const activeUsers = state.users.filter(
            (user) => parseISO(user.lastActive) >= thirtyDaysAgo
          );
          return { users: activeUsers };
        });
      },

      getLeaderboard: (timeframe) => {
        const { users } = get();
        const now = new Date();
        const timeframeStart = {
          weekly: subDays(now, 7),
          monthly: subDays(now, 30),
          allTime: subDays(now, 365),
        }[timeframe];

        return users
          .filter((user) => parseISO(user.lastActive) >= timeframeStart)
          .sort((a, b) => b.points - a.points)
          .slice(0, 100);
      },

      calculateUserRank: (userId) => {
        const { users } = get();
        const sortedUsers = [...users].sort((a, b) => b.points - a.points);
        const userIndex = sortedUsers.findIndex(user => user.id === userId);
        return userIndex === -1 ? users.length + 1 : userIndex + 1;
      },

      updateUserStats: () => {
        const habitStore = useHabitStore.getState();
        const authStore = useAuthStore.getState();
        const { habits } = habitStore;
        const { user, isGuest } = authStore;

        const userId = user?.uid || 'guest';
        if (!habits.length) return;

        const totalHabits = habits.length;
        const totalCompletions = habits.reduce(
          (sum, habit) => sum + habit.completedDates.length,
          0
        );

        const last30Days = Array.from({ length: 30 }, (_, i) => 
          format(subDays(new Date(), i), 'yyyy-MM-dd')
        );

        const completionsLast30Days = habits.reduce((sum, habit) => {
          return sum + habit.completedDates.filter(date => 
            last30Days.includes(date)
          ).length;
        }, 0);

        const maxPossibleCompletions = totalHabits * 30;
        const completionRate = maxPossibleCompletions > 0
          ? (completionsLast30Days / maxPossibleCompletions) * 100
          : 0;

        // Calculate achievements
        const achievements: string[] = [];
        if (totalHabits >= 1) achievements.push('Habit Starter');
        if (totalHabits >= 5) achievements.push('Habit Hunter');
        if (totalHabits >= 10) achievements.push('Habit Master');
        if (Math.max(...habits.map(h => h.streak)) >= 7) achievements.push('Week Warrior');
        if (Math.max(...habits.map(h => h.streak)) >= 30) achievements.push('Monthly Master');
        if (completionRate >= 90) achievements.push('Perfectionist');

        get().addOrUpdateUser({
          id: userId,
          username: user?.displayName || 'Guest',
          photoURL: user?.photoURL,
          totalHabits,
          totalCompletions,
          completionRate: Math.round(completionRate),
          streak: Math.max(...habits.map(h => h.streak)),
          lastActive: new Date().toISOString(),
          achievements,
          isGuest,
        });
      },

      syncLeaderboard: async () => {
        const { isSyncing } = get();
        if (isSyncing) return;

        set({ isSyncing: true });
        try {
          // Here you would typically sync with Firebase
          set({ 
            lastSync: new Date().toISOString(),
            isSyncing: false
          });
        } catch (error) {
          console.error('Failed to sync leaderboard:', error);
          set({ isSyncing: false });
        }
      },

      startAutoSync: () => {
        if (syncInterval) return;
        get().syncLeaderboard();
        syncInterval = setInterval(() => {
          get().syncLeaderboard();
        }, 5 * 60 * 1000);
      },

      stopAutoSync: () => {
        if (syncInterval) {
          clearInterval(syncInterval);
          syncInterval = null;
        }
      },
    }),
    {
      name: 'leaderboard-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.startAutoSync();
        }
      },
    }
  )
);