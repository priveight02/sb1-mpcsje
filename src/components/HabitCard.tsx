import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Book, Brain, Dumbbell, Coffee, Heart, Music, Pencil, Sun, Droplets } from 'lucide-react';
import type { Habit } from '../types/habit';
import { HabitProperties } from './HabitProperties';
import { useHabitStore } from '../store/habitStore';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { AnimatedCheckbox } from './shared/AnimatedCheckbox';
import { triggerCompletionConfetti } from '../utils/confetti';
import toast from 'react-hot-toast';

const ICONS = {
  Activity,
  Book,
  Brain,
  Dumbbell,
  Coffee,
  Heart,
  Music,
  Pencil,
  Sun,
  Droplets,
} as const;

type IconName = keyof typeof ICONS;

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  isCompleted: boolean;
}

export const HabitCard = forwardRef<HTMLDivElement, HabitCardProps>(({
  habit,
  onToggle,
  isCompleted,
}, ref) => {
  const [showProperties, setShowProperties] = React.useState(false);
  const Icon = ICONS[habit.icon as IconName] || Activity;
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const updateLeaderboard = useLeaderboardStore((state) => state.updateUserStats);

  const progress = habit.progress ? Math.min(100, habit.progress.current) : 0;
  const [lastProgress, setLastProgress] = React.useState(progress);
  const [wasCompleted, setWasCompleted] = React.useState(isCompleted);

  React.useEffect(() => {
    // Check if progress just reached 100%
    if (progress === 100 && lastProgress < 100) {
      triggerCompletionConfetti();
      toast.success('Target reached! Congratulations!');
    }
    setLastProgress(progress);

    // Check if habit was just completed
    if (isCompleted && !wasCompleted) {
      triggerCompletionConfetti();
      toast.success('Habit completed! Keep up the great work!');
    }
    setWasCompleted(isCompleted);
  }, [progress, lastProgress, isCompleted, wasCompleted]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
    updateLeaderboard();
  };

  return (
    <>
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-700
                 hover:shadow-md transition-all duration-200"
        onClick={() => setShowProperties(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AnimatedCheckbox
              checked={isCompleted}
              onChange={handleToggle}
              color={habit.color}
              size="md"
            />
            <div className="flex items-center space-x-2">
              <Icon size={20} style={{ color: habit.color }} />
              <div>
                <h3 className="font-medium text-white">{habit.title}</h3>
                <p className="text-sm text-gray-400">
                  {habit.streak} day streak
                </p>
              </div>
            </div>
          </div>
        </div>

        {habit.description && (
          <p className="mt-2 text-sm text-gray-300 ml-10">
            {habit.description}
          </p>
        )}

        {habit.progress && (
          <div className="mt-3 ml-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">
                {progress}%
              </span>
            </div>
            <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ 
                  duration: 0.8, 
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 50
                }}
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ backgroundColor: habit.color }}
              />
            </div>
          </div>
        )}
      </motion.div>

      <HabitProperties
        habit={habit}
        isOpen={showProperties}
        onClose={() => setShowProperties(false)}
      />
    </>
  );
});

HabitCard.displayName = 'HabitCard';