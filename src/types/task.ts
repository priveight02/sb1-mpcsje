export interface Task {
  id: string;
  habitId?: string;  // Optional - can be standalone task
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  dueDate: string;
  scheduledTime?: string;
  tags: string[];
  subtasks: SubTask[];
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[]; // 0-6 for weekly
    daysOfMonth?: number[]; // 1-31 for monthly
  };
  reminders: {
    enabled: boolean;
    alarmEnabled?: boolean;
    alarmTime?: string;
    times: string[];
    notifyBefore?: number; // minutes
  };
  completedAt?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}