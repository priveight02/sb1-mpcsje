import React from 'react';
import { Crown, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumBadgeProps {
  type: 'basic' | 'premium' | 'elite' | 'ultimate';
  showLabel?: boolean;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ type, showLabel = true }) => {
  const badges = {
    basic: {
      icon: Star,
      color: 'from-blue-500 to-blue-600',
      label: 'Basic'
    },
    premium: {
      icon: Crown,
      color: 'from-purple-500 to-purple-600',
      label: 'Premium'
    },
    elite: {
      icon: Crown,
      color: 'from-yellow-500 to-yellow-600',
      label: 'Elite'
    },
    ultimate: {
      icon: Sparkles,
      color: 'from-emerald-500 to-emerald-600',
      label: 'Ultimate'
    }
  };

  const { icon: Icon, color, label } = badges[type];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full 
                 bg-gradient-to-r shadow-lg"
      style={{
        background: `linear-gradient(to right, var(--${color}-from), var(--${color}-to))`
      }}
    >
      <Icon className="w-4 h-4 text-white" />
      {showLabel && (
        <span className="text-xs font-medium text-white">{label}</span>
      )}
    </motion.div>
  );
};