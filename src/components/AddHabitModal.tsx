import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Book, Brain, Dumbbell, Coffee, Heart, Music, Pencil, Sun, Droplets, Target } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
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

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IconButton: React.FC<{
  icon: IconName;
  selected: boolean;
  onClick: () => void;
}> = ({ icon, selected, onClick }) => {
  const Icon = ICONS[icon];
  
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-4 rounded-xl transition-all duration-200 ${
        selected
          ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/50 dark:to-indigo-800/30'
          : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
      }`}
    >
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.2))',
              border: '2px solid rgba(99, 102, 241, 0.5)',
            }}
          />
        )}
      </AnimatePresence>
      <motion.div
        animate={selected ? { y: -2 } : { y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Icon
          size={24}
          className={`transition-colors duration-200 ${
            selected
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        />
      </motion.div>
    </motion.button>
  );
};

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily' as const,
    category: 'personal',
    color: '#4F46E5',
    icon: 'Activity' as IconName,
    hasProgress: false,
  });

  const addHabit = useHabitStore((state) => state.addHabit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a habit title');
      return;
    }

    const habitData = {
      ...formData,
      progress: formData.hasProgress ? { current: 0 } : null,
    };

    addHabit(habitData);
    toast.success('Habit created successfully!');
    onClose();
    setFormData({
      title: '',
      description: '',
      frequency: 'daily',
      category: 'personal',
      color: '#4F46E5',
      icon: 'Activity',
      hasProgress: false,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold dark:text-white">Create New Habit</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter habit title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Choose Icon
                </label>
                <motion.div
                  className="grid grid-cols-5 gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                >
                  {Object.keys(ICONS).map((iconName) => (
                    <motion.div
                      key={iconName}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <IconButton
                        icon={iconName as IconName}
                        selected={formData.icon === iconName}
                        onClick={() => setFormData({ ...formData, icon: iconName as IconName })}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex gap-2">
                  {['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Track Progress
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.hasProgress}
                    onChange={(e) => setFormData({ ...formData, hasProgress: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                       transition-colors duration-200"
              >
                Create Habit
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};