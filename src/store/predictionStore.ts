import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import SimpleLinearRegression from 'ml-regression-simple-linear';
import { subDays, format, parseISO, isSameDay, getHours, differenceInDays, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { useHabitStore } from './habitStore';

// Advanced analytics helper functions
const calculateStreakProbability = (streaks: number[], currentStreak: number): number => {
  if (streaks.length === 0) return 0;
  const averageStreak = streaks.reduce((a, b) => a + b, 0) / streaks.length;
  const standardDeviation = Math.sqrt(
    streaks.reduce((sq, n) => sq + Math.pow(n - averageStreak, 2), 0) / streaks.length
  );
  
  return (currentStreak > averageStreak) ? 
    Math.min(95, (currentStreak / (averageStreak + standardDeviation)) * 100) :
    Math.max(5, (currentStreak / averageStreak) * 100);
};

const calculateCompletionTrend = (completions: { date: Date; completed: boolean }[]): number => {
  if (completions.length < 7) return 0;
  
  const weeklyRates: number[] = [];
  let currentWeekCompletions = 0;
  let daysInCurrentWeek = 0;
  
  completions.forEach((completion, index) => {
    if (index > 0 && index % 7 === 0) {
      weeklyRates.push(currentWeekCompletions / daysInCurrentWeek);
      currentWeekCompletions = 0;
      daysInCurrentWeek = 0;
    }
    if (completion.completed) currentWeekCompletions++;
    daysInCurrentWeek++;
  });
  
  if (daysInCurrentWeek > 0) {
    weeklyRates.push(currentWeekCompletions / daysInCurrentWeek);
  }
  
  if (weeklyRates.length < 2) return 0;
  
  const regression = new SimpleLinearRegression(
    weeklyRates.map((_, i) => i),
    weeklyRates
  );
  
  return regression.slope;
};

const calculateAdaptabilityScore = (habit: any): number => {
  const missedDaysRecovery = habit.completedDates.reduce((acc: number[], date: string, i: number) => {
    if (i === 0) return acc;
    const dayDiff = differenceInDays(parseISO(date), parseISO(habit.completedDates[i - 1]));
    if (dayDiff > 1) acc.push(dayDiff);
    return acc;
  }, []);

  const recoveryRate = missedDaysRecovery.length > 0 ?
    missedDaysRecovery.filter(days => days <= 3).length / missedDaysRecovery.length :
    1;

  const consistencyScore = calculateConsistencyScore(habit.completedDates);
  const variabilityScore = calculateVariabilityScore(habit.completedDates);

  return Math.round((recoveryRate * 0.4 + consistencyScore * 0.4 + (1 - variabilityScore) * 0.2) * 100);
};

const calculateConsistencyScore = (dates: string[]): number => {
  if (dates.length < 2) return 0;

  const intervals = dates.slice(1).map((date, i) => 
    differenceInDays(parseISO(date), parseISO(dates[i]))
  );

  const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((acc, interval) => 
    acc + Math.pow(interval - averageInterval, 2), 0
  ) / intervals.length;

  return Math.max(0, 1 - Math.sqrt(variance) / 7);
};

const calculateVariabilityScore = (dates: string[]): number => {
  if (dates.length < 7) return 0;

  const dayOfWeekCounts = dates.reduce((acc: Record<number, number>, date) => {
    const dayOfWeek = parseISO(date).getDay();
    acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
    return acc;
  }, {});

  const values = Object.values(dayOfWeekCounts);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;

  return Math.sqrt(variance) / mean;
};

const calculatePredictedSuccess = (habit: any): number => {
  const recentCompletions = habit.completedDates
    .filter((date: string) => 
      isWithinInterval(parseISO(date), {
        start: subDays(new Date(), 30),
        end: new Date()
      })
    ).length;

  const streakScore = Math.min(habit.streak / 30, 1) * 0.3;
  const completionScore = (recentCompletions / 30) * 0.4;
  const adaptabilityScore = (calculateAdaptabilityScore(habit) / 100) * 0.3;

  return Math.round((streakScore + completionScore + adaptabilityScore) * 100);
};

const analyzeTimePatterns = (dates: string[]): Record<string, number> => {
  const hourCounts: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0
  };

  dates.forEach(date => {
    const hour = getHours(parseISO(date));
    if (hour >= 5 && hour < 12) hourCounts.morning++;
    else if (hour >= 12 && hour < 17) hourCounts.afternoon++;
    else if (hour >= 17 && hour < 22) hourCounts.evening++;
    else hourCounts.night++;
  });

  const total = Object.values(hourCounts).reduce((a, b) => a + b, 0);
  if (total === 0) return hourCounts;

  return Object.entries(hourCounts).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: Math.round((value / total) * 100)
  }), {} as Record<string, number>);
};

const calculateDetailedStats = (habit: any): DetailedStats => {
  const dates = habit.completedDates.map((date: string) => parseISO(date));
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 30),
    end: new Date()
  });

  // Calculate weekday completion rates
  const weekdayCompletion = last30Days.reduce((acc: Record<string, number>, date) => {
    const weekday = format(date, 'EEEE');
    const completed = dates.some(d => isSameDay(d, date));
    if (!acc[weekday]) acc[weekday] = 0;
    acc[weekday] += completed ? 1 : 0;
    return acc;
  }, {});

  Object.keys(weekdayCompletion).forEach(day => {
    weekdayCompletion[day] = Math.round((weekdayCompletion[day] / 4) * 100);
  });

  const timeDistribution = analyzeTimePatterns(habit.completedDates);
  const streaks = calculateStreaks(habit.completedDates);
  const trend = calculateCompletionTrend(
    last30Days.map(date => ({
      date,
      completed: dates.some(d => isSameDay(d, date))
    }))
  );

  return {
    weekdayCompletion,
    timeDistribution,
    averageInterval: calculateAverageInterval(habit.completedDates),
    longestStreak: Math.max(...streaks, 0),
    missedDays: calculateMissedDays(habit.completedDates),
    recoveryRate: calculateRecoveryRate(habit.completedDates),
    consistency: calculateConsistencyScore(habit.completedDates),
    variability: calculateVariabilityScore(habit.completedDates),
    momentum: calculateMomentum(habit.completedDates),
    trend
  };
};

const calculateStreaks = (dates: string[]): number[] => {
  if (dates.length === 0) return [];
  
  const streaks: number[] = [];
  let currentStreak = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const diff = differenceInDays(parseISO(dates[i]), parseISO(dates[i - 1]));
    if (diff === 1) {
      currentStreak++;
    } else {
      streaks.push(currentStreak);
      currentStreak = 1;
    }
  }
  
  streaks.push(currentStreak);
  return streaks;
};

const calculateAverageInterval = (dates: string[]): number => {
  if (dates.length < 2) return 0;
  
  const intervals = dates.slice(1).map((date, i) => 
    differenceInDays(parseISO(date), parseISO(dates[i]))
  );
  
  return Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length * 10) / 10;
};

const calculateMissedDays = (dates: string[]): number => {
  if (dates.length < 2) return 0;
  
  const start = parseISO(dates[0]);
  const end = parseISO(dates[dates.length - 1]);
  const totalDays = differenceInDays(end, start) + 1;
  
  return totalDays - dates.length;
};

const calculateRecoveryRate = (dates: string[]): number => {
  if (dates.length < 2) return 100;
  
  let missedSequences = 0;
  let recoveries = 0;
  
  for (let i = 1; i < dates.length; i++) {
    const diff = differenceInDays(parseISO(dates[i]), parseISO(dates[i - 1]));
    if (diff > 1) {
      missedSequences++;
      if (diff <= 3) recoveries++;
    }
  }
  
  return missedSequences === 0 ? 100 : Math.round((recoveries / missedSequences) * 100);
};

const calculateMomentum = (dates: string[]): number => {
  if (dates.length === 0) return 0;
  
  const last7Days = dates.filter(date => 
    isWithinInterval(parseISO(date), {
      start: subDays(new Date(), 7),
      end: new Date()
    })
  ).length;
  
  const previous7Days = dates.filter(date => 
    isWithinInterval(parseISO(date), {
      start: subDays(new Date(), 14),
      end: subDays(new Date(), 7)
    })
  ).length;
  
  return previous7Days === 0 ? 
    Math.min(last7Days / 7 * 100, 100) : 
    Math.min((last7Days / previous7Days) * 100, 200);
};

interface DetailedStats {
  weekdayCompletion: Record<string, number>;
  timeDistribution: Record<string, number>;
  averageInterval: number;
  longestStreak: number;
  missedDays: number;
  recoveryRate: number;
  consistency: number;
  variability: number;
  momentum: number;
  trend: number;
}

interface PredictionData {
  habitId: string;
  predictedCompletionRate: number;
  predictedStreak: number;
  nextMilestone: number;
  suggestedImprovements: string[];
  confidence: number;
  trend: number;
  detailedStats: DetailedStats;
  visualizationData: {
    completionRate: number;
    streak: number;
    trend: number;
    consistency: number;
    timeOfDay: Record<string, number>;
  };
}

interface PredictionStore {
  predictions: Record<string, PredictionData>;
  generatePredictions: () => void;
  getPredictionForHabit: (habitId: string) => PredictionData | null;
  getImprovementSuggestions: (habitId: string) => string[];
}

export const usePredictionStore = create<PredictionStore>()(
  persist(
    (set, get) => ({
      predictions: {},

      generatePredictions: () => {
        const habits = useHabitStore.getState().habits;
        const newPredictions: Record<string, PredictionData> = {};

        habits.forEach((habit) => {
          const detailedStats = calculateDetailedStats(habit);
          const predictedSuccess = calculatePredictedSuccess(habit);
          const adaptabilityScore = calculateAdaptabilityScore(habit);

          const streaks = calculateStreaks(habit.completedDates);
          const predictedStreak = Math.round(
            habit.streak * (1 + Math.max(0, detailedStats.trend))
          );

          const nextMilestone = Math.ceil((habit.streak + 1) / 10) * 10;

          const suggestions = generateComprehensiveSuggestions(
            habit,
            detailedStats,
            predictedSuccess,
            habit.streak,
            detailedStats.trend
          );

          newPredictions[habit.id] = {
            habitId: habit.id,
            predictedCompletionRate: predictedSuccess,
            predictedStreak,
            nextMilestone,
            suggestedImprovements: suggestions,
            confidence: calculateStreakProbability(streaks, habit.streak),
            trend: detailedStats.trend,
            detailedStats,
            visualizationData: {
              completionRate: predictedSuccess,
              streak: habit.streak,
              trend: detailedStats.trend,
              consistency: detailedStats.consistency * 100,
              timeOfDay: detailedStats.timeDistribution,
            },
          };
        });

        set({ predictions: newPredictions });
      },

      getPredictionForHabit: (habitId) => {
        const predictions = get().predictions;
        if (!predictions[habitId]) {
          get().generatePredictions();
        }
        return get().predictions[habitId] || null;
      },

      getImprovementSuggestions: (habitId) => {
        const prediction = get().predictions[habitId];
        return prediction?.suggestedImprovements || [];
      },
    }),
    {
      name: 'prediction-storage',
    }
  )
);

function generateComprehensiveSuggestions(
  habit: any,
  stats: DetailedStats,
  predictedSuccess: number,
  currentStreak: number,
  trend: number
): string[] {
  const suggestions: string[] = [];

  // Time-based optimization
  const bestTime = Object.entries(stats.timeDistribution)
    .sort(([, a], [, b]) => b - a)[0][0];
  suggestions.push(`Your success rate is highest during ${bestTime}. Try to consistently schedule this habit during this time window.`);

  // Weekday optimization
  const bestDay = Object.entries(stats.weekdayCompletion)
    .sort(([, a], [, b]) => b - a)[0][0];
  const worstDay = Object.entries(stats.weekdayCompletion)
    .sort(([, a], [, b]) => a - b)[0][0];
  suggestions.push(`You're most successful on ${bestDay}s (${stats.weekdayCompletion[bestDay]}% completion rate). Consider what makes this day work well for you.`);
  
  if (stats.weekdayCompletion[worstDay] < 50) {
    suggestions.push(`${worstDay}s show a lower completion rate (${stats.weekdayCompletion[worstDay]}%). Try setting specific reminders or restructuring your schedule for this day.`);
  }

  // Streak-based insights
  if (currentStreak < stats.longestStreak) {
    suggestions.push(`You've achieved a ${stats.longestStreak}-day streak before. Based on your pattern, you can reach this again within ${Math.ceil((stats.longestStreak - currentStreak) / (1 + Math.max(0, trend)))} days.`);
  }

  // Recovery patterns
  if (stats.recoveryRate < 70) {
    suggestions.push(`Your recovery rate after missed days is ${stats.recoveryRate}%. Focus on bouncing back within 24 hours of missing a day to improve this metric.`);
  }

  // Consistency insights
  if (stats.consistency < 0.7) {
    suggestions.push(`Your habit consistency is at ${Math.round(stats.consistency * 100)}%. Try to maintain fixed time slots for this habit to improve regularity.`);
  }

  // Momentum-based suggestions
  if (stats.momentum < 80) {
    suggestions.push(`Your current momentum is lower than usual. Focus on small wins and try to complete this habit even partially to rebuild momentum.`);
  } else if (stats.momentum > 120) {
    suggestions.push(`You're on a strong upward trend! This is an ideal time to increase your challenge level or add complementary habits.`);
  }

  // Interval optimization
  if (stats.averageInterval > 1.5) {
    suggestions.push(`Your average interval between completions is ${stats.averageInterval} days. Try to reduce this to improve overall consistency.`);
  }

  // Trend-based insights
  if (trend < -0.1) {
    suggestions.push(`Your completion rate has declined by ${Math.abs(Math.round(trend * 100))}% recently. Consider breaking down the habit into smaller, more manageable steps.`);
  } else if (trend > 0.1) {
    suggestions.push(`You're showing strong improvement with a ${Math.round(trend * 100)}% positive trend. Keep this momentum going!`);
  }

  // Predictive insights
  if (predictedSuccess < 40) {
    suggestions.push(`Based on your patterns, there's a ${predictedSuccess}% chance of maintaining this habit. Start with 2-3 days per week to build a strong foundation.`);
  } else if (predictedSuccess > 80) {
    suggestions.push(`You have a ${predictedSuccess}% predicted success rate! Consider increasing the challenge or linking this habit with a new complementary one.`);
  }

  // Variability insights
  if (stats.variability > 0.5) {
    suggestions.push(`Your habit completion shows high variability. Try to identify and eliminate the factors that cause inconsistency.`);
  }

  return suggestions
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
}