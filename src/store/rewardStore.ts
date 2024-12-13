import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useLeaderboardStore } from './leaderboardStore';

interface BubbleReward {
  id: string;
  points: number;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  color: string;
}

interface RewardStore {
  isActive: boolean;
  cooldownMinutes: number;
  lastRewardTime: string | null;
  currentBubbles: BubbleReward[];
  totalPointsEarned: number;
  sessionTime: number;
  startSession: () => void;
  updateSessionTime: () => void;
  generateBubbles: () => void;
  claimBubble: (bubbleId: string) => void;
  clearBubbles: () => void;
}

const COLORS = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
];

const generateRandomBubble = (): BubbleReward => {
  const sizes = ['small', 'medium', 'large'] as const;
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  
  const pointsRange = {
    small: { min: 10, max: 50 },
    medium: { min: 51, max: 200 },
    large: { min: 201, max: 435 },
  };

  const range = pointsRange[size];
  const points = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  return {
    id: crypto.randomUUID(),
    points,
    size,
    position: {
      x: Math.random() * (window.innerWidth - 100),
      y: Math.random() * (window.innerHeight - 100),
    },
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
};

export const useRewardStore = create<RewardStore>()(
  persist(
    (set, get) => ({
      isActive: false,
      cooldownMinutes: 20,
      lastRewardTime: null,
      currentBubbles: [],
      totalPointsEarned: 0,
      sessionTime: 0,

      startSession: () => {
        set({ isActive: true, sessionTime: 0 });
      },

      updateSessionTime: () => {
        const state = get();
        const newSessionTime = state.sessionTime + 1;
        set({ sessionTime: newSessionTime });

        // Check if it's time for rewards
        if (state.isActive && newSessionTime % (state.cooldownMinutes * 60) === 0) {
          const now = new Date();
          if (!state.lastRewardTime || 
              (now.getTime() - new Date(state.lastRewardTime).getTime()) >= state.cooldownMinutes * 60 * 1000) {
            get().generateBubbles();
            set({ 
              lastRewardTime: now.toISOString(),
              cooldownMinutes: Math.min(state.cooldownMinutes + 10, 60), // Increase cooldown, cap at 60 mins
            });
          }
        }
      },

      generateBubbles: () => {
        const numBubbles = Math.floor(Math.random() * 3) + 3; // 3-5 bubbles
        const bubbles = Array.from({ length: numBubbles }, generateRandomBubble);
        set({ currentBubbles: bubbles });

        // Auto-clear bubbles after 15 seconds
        setTimeout(() => {
          get().clearBubbles();
        }, 15000);
      },

      claimBubble: (bubbleId: string) => {
        const state = get();
        const bubble = state.currentBubbles.find(b => b.id === bubbleId);
        if (!bubble) return;

        // Update points in leaderboard
        const { updateUserStats } = useLeaderboardStore.getState();
        updateUserStats();

        set(state => ({
          currentBubbles: state.currentBubbles.filter(b => b.id !== bubbleId),
          totalPointsEarned: state.totalPointsEarned + bubble.points,
        }));
      },

      clearBubbles: () => {
        set({ currentBubbles: [] });
      },
    }),
    {
      name: 'reward-storage',
    }
  )
);