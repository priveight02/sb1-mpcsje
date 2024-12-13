import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Bell, AlarmClock, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '../../types/task';
import { PriorityBadge } from './PriorityBadge';
import { useTaskStore } from '../../store/taskStore';
import { triggerCompletionConfetti } from '../../utils/confetti';
import toast from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(({ task, onEdit, onDelete }, ref) => {
  const updateTask = useTaskStore((state) => state.updateTask);
  const [wasCompleted, setWasCompleted] = React.useState(task.status === 'completed');

  const handleToggleComplete = () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask(task.id, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
    });

    if (newStatus === 'completed') {
      triggerCompletionConfetti();
      toast.success('Task completed! Great job!');
    }
  };

  React.useEffect(() => {
    // Check if task was just completed
    if (task.status === 'completed' && !wasCompleted) {
      triggerCompletionConfetti();
    }
    setWasCompleted(task.status === 'completed');
  }, [task.status, wasCompleted]);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-700
                hover:shadow-md transition-all duration-200 ${
                  task.status === 'completed' ? 'opacity-60 bg-gray-800/50' : ''
                }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleComplete}
            className="relative w-6 h-6 flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {task.status === 'completed' ? (
                <motion.div
                  key="checked"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                  className="absolute inset-0"
                >
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 10 }}
                      className="absolute inset-0 bg-gradient-to-tr from-green-400 to-green-500 rounded-full"
                    />
                    <CheckCircle2 className="w-6 h-6 text-white relative z-10" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="unchecked"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <Circle className="w-6 h-6 text-gray-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-medium text-white transition-all duration-200 ${
                task.status === 'completed' ? 'line-through text-gray-400' : ''
              }`}>
                {task.title}
              </h3>
              <PriorityBadge priority={task.priority} />
            </div>
            {task.description && (
              <p className={`text-sm text-gray-400 mt-1 transition-all duration-200 ${
                task.status === 'completed' ? 'line-through opacity-60' : ''
              }`}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className={`mt-3 flex items-center gap-4 text-sm text-gray-400 transition-all duration-200 ${
        task.status === 'completed' ? 'opacity-60' : ''
      }`}>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {format(new Date(task.dueDate), 'MMM d, yyyy')}
        </div>
        {task.scheduledTime && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {task.scheduledTime}
          </div>
        )}
        {task.reminders.enabled && (
          <div className="flex items-center gap-1">
            <Bell className="w-4 h-4" />
            {task.reminders.notifyBefore}m before
          </div>
        )}
        {task.reminders.alarmEnabled && task.reminders.alarmTime && (
          <div className="flex items-center gap-1">
            <AlarmClock className="w-4 h-4 text-indigo-400" />
            {task.reminders.alarmTime}
          </div>
        )}
      </div>
    </motion.div>
  );
});

TaskCard.displayName = 'TaskCard';