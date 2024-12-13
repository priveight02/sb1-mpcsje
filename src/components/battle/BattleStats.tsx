import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Target, Users, Clock, ArrowUp, 
  ArrowDown, Activity, Award
} from 'lucide-react';
import { useBattleStore } from '../../store/battleStore';

interface BattleStatsProps {
  battleId: string;
}

export const BattleStats: React.FC<BattleStatsProps> = ({ battleId }) => {
  const battle = useBattleStore((state) => state.getBattleById(battleId));

  if (!battle) return null;

  // Ensure statistics exist with default values
  const statistics = battle.statistics || {
    totalHabitsCompleted: 0,
    averageStreak: 0,
    topPerformer: 'No data',
    mostActiveTime: 'No data',
    participationRate: 0
  };

  const stats = [
    {
      icon: Trophy,
      label: 'Total Habits Completed',
      value: statistics.totalHabitsCompleted,
      color: 'text-yellow-500'
    },
    {
      icon: Target,
      label: 'Average Streak',
      value: `${statistics.averageStreak} days`,
      color: 'text-green-500'
    },
    {
      icon: Award,
      label: 'Top Performer',
      value: statistics.topPerformer,
      color: 'text-purple-500'
    },
    {
      icon: Clock,
      label: 'Most Active Time',
      value: statistics.mostActiveTime,
      color: 'text-blue-500'
    },
    {
      icon: Users,
      label: 'Participation Rate',
      value: `${statistics.participationRate}%`,
      color: 'text-indigo-500'
    }
  ];

  // Sort participants by points with null check
  const rankedParticipants = [...(battle.participants || [])].sort(
    (a, b) => (b.progress?.totalPoints || 0) - (a.progress?.totalPoints || 0)
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {label}
              </span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Battle Leaderboard
        </h3>
        <div className="space-y-3">
          {rankedParticipants.map((participant, index) => (
            <motion.div
              key={participant.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 
                       dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                              ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                index === 1 ? 'bg-gray-100 text-gray-600' :
                                index === 2 ? 'bg-orange-100 text-orange-600' :
                                'bg-blue-100 text-blue-600'} 
                              dark:bg-opacity-20`}
                >
                  {index + 1}
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {participant.username}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Activity className="w-4 h-4" />
                    {participant.progress?.completedHabits || 0} habits
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {participant.progress?.totalPoints || 0} pts
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {(participant.progress?.streak || 0) > 0 ? (
                    <>
                      <ArrowUp className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">
                        {participant.progress?.streak || 0} streak
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">No streak</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};