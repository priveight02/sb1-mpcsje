import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { usePremiumStore } from './premiumStore';
import { sendNotification } from '../utils/notifications';
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns';

interface BattleMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}

interface BattleParticipant {
  userId: string;
  username: string;
  isOwner: boolean;
  habits: string[];
  progress: {
    completedHabits: number;
    streak: number;
    lastActive: string;
    dailyProgress: Record<string, number>;
    weeklyProgress: Record<string, number>;
    totalPoints: number;
  };
}

interface BattleSettings {
  duration: number;
  stakes: 'friendly' | 'competitive' | 'hardcore';
  winCondition: 'firstToComplete' | 'mostCompleted' | 'highestStreak';
  maxParticipants: number;
  allowLateJoin: boolean;
  requireVerification: boolean;
  autoEnd: boolean;
}

interface Battle {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  settings: BattleSettings;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  participants: BattleParticipant[];
  startDate: string;
  endDate: string;
  messages: BattleMessage[];
  statistics: {
    totalHabitsCompleted: number;
    averageStreak: number;
    topPerformer: string;
    mostActiveTime: string;
    participationRate: number;
  };
}

interface WeeklyBattleCreations {
  count: number;
  weekStart: string;
}

interface BattleStore {
  battles: Battle[];
  weeklyBattleCreations: WeeklyBattleCreations;
  createBattle: (title: string, settings: BattleSettings) => string;
  joinBattle: (battleId: string) => void;
  leaveBattle: (battleId: string) => void;
  getBattleById: (battleId: string) => Battle | undefined;
  getParticipantBattles: () => Battle[];
  sendMessage: (battleId: string, message: Omit<BattleMessage, 'id'>) => Promise<BattleMessage>;
  getMessages: (battleId: string) => BattleMessage[];
  syncMessages: (battleId: string) => Promise<void>;
  updateBattleStatistics: (battleId: string) => void;
  updateBattleProgress: (battleId: string, userId: string, habitId: string, completed: boolean) => void;
  resetWeeklyBattleCount: () => void;
}

export const useBattleStore = create<BattleStore>()(
  persist(
    (set, get) => ({
      battles: [],
      weeklyBattleCreations: {
        count: 0,
        weekStart: startOfWeek(new Date()).toISOString()
      },

      createBattle: (title, settings) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          throw new Error('Must be logged in to create a battle');
        }

        // Check weekly battle limit
        const { hasFeature, isFeatureEnabled } = usePremiumStore.getState();
        const hasUnlimitedBattles = hasFeature('unlimited_battles') && isFeatureEnabled('unlimited_battles');
        const { weeklyBattleCreations } = get();

        // Reset weekly count if it's a new week
        const currentWeekStart = startOfWeek(new Date()).toISOString();
        if (currentWeekStart !== weeklyBattleCreations.weekStart) {
          get().resetWeeklyBattleCount();
        }

        if (!hasUnlimitedBattles && weeklyBattleCreations.count >= 2) {
          throw new Error('Weekly battle limit reached');
        }

        const battleId = crypto.randomUUID();
        const startDate = new Date().toISOString();
        const endDate = new Date(Date.now() + settings.duration * 24 * 60 * 60 * 1000).toISOString();

        const battle: Battle = {
          id: battleId,
          ownerId: user.uid,
          title,
          settings,
          status: 'waiting',
          participants: [{
            userId: user.uid,
            username: user.displayName || 'Anonymous',
            isOwner: true,
            habits: [],
            progress: {
              completedHabits: 0,
              streak: 0,
              lastActive: new Date().toISOString(),
              dailyProgress: {},
              weeklyProgress: {},
              totalPoints: 0
            }
          }],
          startDate,
          endDate,
          messages: [],
          statistics: {
            totalHabitsCompleted: 0,
            averageStreak: 0,
            topPerformer: '',
            mostActiveTime: '',
            participationRate: 0
          }
        };

        // Update weekly battle count for non-premium users
        if (!hasUnlimitedBattles) {
          set((state) => ({
            weeklyBattleCreations: {
              ...state.weeklyBattleCreations,
              count: state.weeklyBattleCreations.count + 1
            }
          }));
        }

        set((state) => ({
          battles: [...state.battles, battle]
        }));

        return battleId;
      },

      resetWeeklyBattleCount: () => {
        set({
          weeklyBattleCreations: {
            count: 0,
            weekStart: startOfWeek(new Date()).toISOString()
          }
        });
      },

      joinBattle: (battleId) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          throw new Error('Must be logged in to join a battle');
        }

        set((state) => {
          const battle = state.battles.find(b => b.id === battleId);
          if (!battle) throw new Error('Battle not found');
          
          if (battle.status !== 'waiting' && !battle.settings.allowLateJoin) {
            throw new Error('Battle has already started');
          }
          
          if (battle.participants.length >= battle.settings.maxParticipants) {
            throw new Error('Battle is full');
          }
          
          if (battle.participants.some(p => p.userId === user.uid)) {
            throw new Error('Already joined this battle');
          }

          const updatedBattle = {
            ...battle,
            participants: [
              ...battle.participants,
              {
                userId: user.uid,
                username: user.displayName || 'Anonymous',
                isOwner: false,
                habits: [],
                progress: {
                  completedHabits: 0,
                  streak: 0,
                  lastActive: new Date().toISOString(),
                  dailyProgress: {},
                  weeklyProgress: {},
                  totalPoints: 0
                }
              }
            ]
          };

          // Notify battle owner
          if (battle.ownerId) {
            sendNotification('New Battle Participant', {
              body: `${user.displayName || 'Someone'} has joined your battle "${battle.title}"!`
            });
          }

          return { battles: state.battles.map(b => b.id === battleId ? updatedBattle : b) };
        });
      },

      leaveBattle: (battleId) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set((state) => {
          const battle = state.battles.find(b => b.id === battleId);
          if (!battle) return state;

          if (battle.ownerId === user.uid) {
            return { battles: state.battles.filter(b => b.id !== battleId) };
          }

          return {
            battles: state.battles.map(b => 
              b.id === battleId ? {
                ...b,
                participants: b.participants.filter(p => p.userId !== user.uid)
              } : b
            )
          };
        });
      },

      getBattleById: (battleId) => {
        return get().battles.find(b => b.id === battleId);
      },

      getParticipantBattles: () => {
        const { user } = useAuthStore.getState();
        if (!user) return [];
        return get().battles.filter(b => 
          b.participants.some(p => p.userId === user.uid)
        );
      },

      sendMessage: async (battleId, message) => {
        const newMessage = {
          ...message,
          id: crypto.randomUUID()
        };

        set((state) => ({
          battles: state.battles.map(battle =>
            battle.id === battleId
              ? { ...battle, messages: [...battle.messages, newMessage] }
              : battle
          )
        }));

        return newMessage;
      },

      getMessages: (battleId) => {
        const battle = get().getBattleById(battleId);
        return battle?.messages || [];
      },

      syncMessages: async (battleId) => {
        // Real-time sync implementation
        const battle = get().getBattleById(battleId);
        if (!battle) return;

        try {
          // Sync messages with other participants
          // This would typically involve WebSocket or Firebase real-time updates
          // For now, we'll just use local state
        } catch (error) {
          console.error('Failed to sync messages:', error);
        }
      },

      updateBattleStatistics: (battleId) => {
        set((state) => {
          const battle = state.battles.find(b => b.id === battleId);
          if (!battle) return state;

          const totalHabits = battle.participants.reduce(
            (sum, p) => sum + p.progress.completedHabits,
            0
          );

          const avgStreak = battle.participants.reduce(
            (sum, p) => sum + p.progress.streak,
            0
          ) / battle.participants.length;

          const topPerformer = battle.participants.reduce(
            (top, p) => p.progress.totalPoints > (top?.progress.totalPoints || 0) ? p : top,
            battle.participants[0]
          );

          const participationRate = battle.participants.filter(
            p => new Date(p.progress.lastActive).getTime() > Date.now() - 24 * 60 * 60 * 1000
          ).length / battle.participants.length * 100;

          return {
            battles: state.battles.map(b =>
              b.id === battleId
                ? {
                    ...b,
                    statistics: {
                      totalHabitsCompleted: totalHabits,
                      averageStreak: Math.round(avgStreak * 10) / 10,
                      topPerformer: topPerformer.username,
                      mostActiveTime: '9:00 AM - 11:00 AM',
                      participationRate: Math.round(participationRate)
                    }
                  }
                : b
            )
          };
        });
      },

      updateBattleProgress: (battleId, userId, habitId, completed) => {
        set((state) => {
          const updatedBattles = state.battles.map(battle => {
            if (battle.id !== battleId) return battle;

            return {
              ...battle,
              participants: battle.participants.map(participant => {
                if (participant.userId !== userId) return participant;

                const today = format(new Date(), 'yyyy-MM-dd');
                const dailyProgress = {
                  ...participant.progress.dailyProgress,
                  [today]: (participant.progress.dailyProgress[today] || 0) + (completed ? 1 : -1)
                };

                return {
                  ...participant,
                  progress: {
                    ...participant.progress,
                    completedHabits: participant.progress.completedHabits + (completed ? 1 : -1),
                    lastActive: new Date().toISOString(),
                    dailyProgress,
                    totalPoints: participant.progress.totalPoints + (completed ? 10 : -10)
                  }
                };
              })
            };
          });

          return { battles: updatedBattles };
        });

        // Update statistics after progress change
        get().updateBattleStatistics(battleId);
      }
    }),
    {
      name: 'battle-storage',
      version: 1,
    }
  )
);