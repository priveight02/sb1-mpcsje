import { Note } from './note';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
  createdAt: string;
  completedDates: string[];
  streak: number;
  progress?: {
    current: number;
    target?: number;
    unit?: string;
  };
  notes?: Note[];
  schedule?: {
    preferredTime?: string;
    daysOfWeek?: number[];
    reminder: {
      enabled: boolean;
      times: string[];
      notifyBefore?: number;
    };
    linkedTasks?: string[];
  };
  analytics?: {
    bestStreak: number;
    totalCompletions: number;
    averageCompletionTime?: string;
    mostProductiveDay?: number;
    mostProductiveTime?: string;
    consistency: number;
  };
  challenges?: {
    current?: {
      id: string;
      name: string;
      target: number;
      progress: number;
      endDate: string;
    };
    completed: Array<{
      id: string;
      name: string;
      completedDate: string;
    }>;
  };
}