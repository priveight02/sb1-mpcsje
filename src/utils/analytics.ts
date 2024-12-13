import { firestore } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, limit, startAfter, DocumentData } from 'firebase/firestore';
import { subDays, startOfDay, endOfDay, parseISO } from 'date-fns';

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalHabits: number;
  completionRate: number;
  averageStreak: number;
  userGrowth: number[];
  habitActivity: number[];
  userLocations: Record<string, number>;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

export const fetchAnalytics = async (timeRange: string): Promise<AnalyticsData> => {
  const now = new Date();
  const rangeStart = subDays(now, parseInt(timeRange));

  // Fetch users
  const usersRef = collection(firestore, 'users');
  const usersQuery = query(
    usersRef,
    where('createdAt', '>=', rangeStart.toISOString())
  );
  const usersSnapshot = await getDocs(usersQuery);
  const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Fetch habits
  const habitsRef = collection(firestore, 'habits');
  const habitsSnapshot = await getDocs(habitsRef);
  const habits = habitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Calculate metrics
  const activeUsers = users.filter(user => 
    parseISO(user.lastLoginAt) >= rangeStart
  ).length;

  const newUsers = users.filter(user => 
    parseISO(user.createdAt) >= rangeStart
  ).length;

  const completedHabits = habits.reduce((total, habit) => {
    const completionsInRange = habit.completedDates.filter((date: string) => 
      parseISO(date) >= rangeStart
    ).length;
    return total + completionsInRange;
  }, 0);

  const totalPossibleCompletions = habits.length * parseInt(timeRange);
  const completionRate = totalPossibleCompletions > 0 
    ? (completedHabits / totalPossibleCompletions) * 100 
    : 0;

  const averageStreak = habits.reduce((sum, habit) => 
    sum + (habit.streak || 0), 0
  ) / habits.length || 0;

  // Calculate user growth over time
  const userGrowth = await calculateUserGrowth(timeRange);

  // Calculate habit activity
  const habitActivity = await calculateHabitActivity(timeRange);

  // Get user locations
  const userLocations = await getUserLocations();

  // Get device stats
  const deviceStats = await getDeviceStats();

  return {
    totalUsers: users.length,
    activeUsers,
    newUsers,
    totalHabits: habits.length,
    completionRate,
    averageStreak,
    userGrowth,
    habitActivity,
    userLocations,
    deviceStats
  };
};

const calculateUserGrowth = async (timeRange: string): Promise<number[]> => {
  const now = new Date();
  const days = parseInt(timeRange);
  const growth: number[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const usersQuery = query(
      collection(firestore, 'users'),
      where('createdAt', '<=', endOfDay(date).toISOString())
    );
    const snapshot = await getDocs(usersQuery);
    growth.push(snapshot.size);
  }

  return growth;
};

const calculateHabitActivity = async (timeRange: string): Promise<number[]> => {
  const now = new Date();
  const days = parseInt(timeRange);
  const activity: number[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const start = startOfDay(date);
    const end = endOfDay(date);

    const completionsQuery = query(
      collection(firestore, 'habitCompletions'),
      where('completedAt', '>=', start.toISOString()),
      where('completedAt', '<=', end.toISOString())
    );
    const snapshot = await getDocs(completionsQuery);
    activity.push(snapshot.size);
  }

  return activity;
};

const getUserLocations = async (): Promise<Record<string, number>> => {
  const locationsRef = collection(firestore, 'userLocations');
  const snapshot = await getDocs(locationsRef);
  
  const locations: Record<string, number> = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    locations[data.location] = (locations[data.location] || 0) + 1;
  });

  return locations;
};

const getDeviceStats = async () => {
  const devicesRef = collection(firestore, 'devices');
  const snapshot = await getDocs(devicesRef);
  
  const stats = {
    mobile: 0,
    desktop: 0,
    tablet: 0
  };

  snapshot.forEach(doc => {
    const data = doc.data();
    if (stats[data.type] !== undefined) {
      stats[data.type]++;
    }
  });

  return stats;
};