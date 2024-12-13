import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Store, ListTodo, PlusCircle } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { HabitCard } from './HabitCard';
import { TaskList } from './tasks/TaskList';
import { Leaderboard } from './Leaderboard';
import { StorePanel } from './store/StorePanel';
import { TaskModal } from './tasks/TaskModal';
import { format } from 'date-fns';

export const HabitList: React.FC = () => {
  const habits = useHabitStore((state) => state.habits);
  const toggleHabit = useHabitStore((state) => state.toggleHabit);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="pt-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 mb-4">
              <ListTodo className="w-5 h-5 text-indigo-400 mr-2" />
              <span className="text-white font-medium">Habits</span>
            </div>
            <p className="text-gray-400 mt-1">Track your daily progress and build lasting habits</p>
          </div>
          <div className="relative flex gap-3">
            {/* Store Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowStore(!showStore);
                setShowLeaderboard(false);
              }}
              className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 
                       flex items-center justify-center group overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 opacity-0 
                         group-hover:opacity-20 transition-opacity duration-300"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 45, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <div className="absolute inset-[2px] rounded-[10px] bg-gray-900 flex items-center justify-center
                            ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all duration-300">
                <Store className="w-7 h-7 text-emerald-500 group-hover:text-emerald-400 transition-colors duration-300" />
              </div>
              {showStore && (
                <motion.div
                  layoutId="storeIndicator"
                  className="absolute -bottom-1 left-1/2 w-10 h-1 rounded-full bg-gradient-to-r 
                           from-emerald-500 to-green-500"
                  style={{ translateX: '-50%' }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>

            {/* Add Task Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTaskModal(true)}
              className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-600/20 
                       flex items-center justify-center group overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-600 opacity-0 
                         group-hover:opacity-20 transition-opacity duration-300"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 45, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <div className="absolute inset-[2px] rounded-[10px] bg-gray-900 flex items-center justify-center
                            ring-1 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all duration-300">
                <PlusCircle className="w-7 h-7 text-indigo-500 group-hover:text-indigo-400 transition-colors duration-300" />
              </div>
            </motion.button>

            {/* Leaderboard Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowLeaderboard(!showLeaderboard);
                setShowStore(false);
              }}
              className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 
                       flex items-center justify-center group overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-600 opacity-0 
                         group-hover:opacity-20 transition-opacity duration-300"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 45, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <div className="absolute inset-[2px] rounded-[10px] bg-gray-900 flex items-center justify-center
                            ring-1 ring-yellow-500/20 group-hover:ring-yellow-500/40 transition-all duration-300">
                <Trophy className="w-7 h-7 text-yellow-500 group-hover:text-yellow-400 transition-colors duration-300" />
              </div>
              {showLeaderboard && (
                <motion.div
                  layoutId="leaderboardIndicator"
                  className="absolute -bottom-1 left-1/2 w-10 h-1 rounded-full bg-gradient-to-r 
                           from-yellow-500 to-amber-500"
                  style={{ translateX: '-50%' }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>

            {/* Panels */}
            <AnimatePresence>
              {showStore && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute right-0 top-16 z-50 w-[calc(100vw-2rem)] max-w-md"
                  style={{ translateX: '50%' }}
                >
                  <StorePanel onClose={() => setShowStore(false)} />
                </motion.div>
              )}

              {showLeaderboard && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute right-0 top-16 z-50 w-[calc(100vw-2rem)] max-w-md"
                  style={{ translateX: '50%' }}
                >
                  <Leaderboard onClose={() => setShowLeaderboard(false)} />
                </motion.div>
              )}

              {showTaskModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TaskModal onClose={() => setShowTaskModal(false)} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <AnimatePresence mode="popLayout">
          {habits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <p className="text-gray-400">
                No habits yet. Click the + button to add one!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3 mt-6">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={habit.completedDates.includes(today)}
                  onToggle={() => toggleHabit(habit.id, today)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Separator */}
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50" />
          <div className="px-4 py-2 rounded-full bg-gray-800/50 text-gray-400 text-sm">
            Tasks
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50" />
        </div>

        {/* Task List */}
        <TaskList />

        {/* Backdrop */}
        <AnimatePresence>
          {(showLeaderboard || showStore) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => {
                setShowLeaderboard(false);
                setShowStore(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};