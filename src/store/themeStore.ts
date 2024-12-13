import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  currentTheme: string;
  isDark: boolean;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
}

export const THEMES = {
  default: {
    id: 'default',
    name: 'Default Dark',
    colors: {
      primary: '#4F46E5',
      background: '#111827',
      card: '#1F2937',
      text: '#FFFFFF'
    },
    premium: false,
    animation: {
      type: 'gradient',
      colors: ['#4F46E5', '#6366F1']
    }
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: {
      primary: '#6366F1',
      background: '#0F172A',
      card: '#1E293B',
      text: '#F8FAFC'
    },
    premium: true,
    animation: {
      type: 'stars',
      density: 30,
      speed: 0.5
    }
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest',
    colors: {
      primary: '#10B981',
      background: '#064E3B',
      card: '#065F46',
      text: '#ECFDF5'
    },
    premium: true,
    animation: {
      type: 'particles',
      color: '#34D399',
      size: 3,
      count: 20
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Gradient',
    colors: {
      primary: '#F59E0B',
      background: '#7C2D12',
      card: '#9A3412',
      text: '#FEF3C7'
    },
    premium: true,
    animation: {
      type: 'rays',
      colors: ['#F59E0B', '#DC2626'],
      speed: 0.3
    }
  },
  royal: {
    id: 'royal',
    name: 'Royal Purple',
    colors: {
      primary: '#8B5CF6',
      background: '#2E1065',
      card: '#4C1D95',
      text: '#F5F3FF'
    },
    premium: true,
    animation: {
      type: 'stars',
      density: 40,
      speed: 0.5
    }
  },
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Voyage',
    colors: {
      primary: '#EC4899',
      background: '#18181B',
      card: '#27272A',
      text: '#FAFAFA'
    },
    premium: true,
    animation: {
      type: 'stars',
      density: 50,
      speed: 0.5
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Depths',
    colors: {
      primary: '#06B6D4',
      background: '#042F2E',
      card: '#134E4A',
      text: '#ECFEFF'
    },
    premium: true,
    animation: {
      type: 'bubbles',
      color: '#34D399',
      size: 3,
      count: 30
    }
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Borealis',
    colors: {
      primary: '#10B981',
      background: '#041434',
      card: '#082454',
      text: '#F0FDF4'
    },
    premium: true,
    animation: {
      type: 'waves',
      colors: ['#10B981', '#06B6D4', '#8B5CF6'],
      speed: 0.3
    }
  },
  neon: {
    id: 'neon',
    name: 'Neon City',
    colors: {
      primary: '#F43F5E',
      background: '#0C0A1F',
      card: '#1A1744',
      text: '#FFFFFF'
    },
    premium: true,
    animation: {
      type: 'grid',
      color: '#F43F5E',
      size: 1.5,
      speed: 0.8
    }
  },
  golden: {
    id: 'golden',
    name: 'Golden Hour',
    colors: {
      primary: '#F59E0B',
      background: '#451A03',
      card: '#78350F',
      text: '#FFFBEB'
    },
    premium: true,
    animation: {
      type: 'rays',
      colors: ['#F59E0B', '#DC2626'],
      speed: 0.3
    }
  }
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      currentTheme: 'default',
      isDark: true,
      setTheme: (theme) => set({ currentTheme: theme }),
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: 'theme-storage',
    }
  )
);