import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: () => void;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  variant?: 'default' | 'settings';
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-7 h-7',
};

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onChange,
  color = '#4F46E5',
  size = 'md',
  disabled = false,
  variant = 'default',
}) => {
  const isSettings = variant === 'settings';

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={onChange}
      disabled={disabled}
      className={`relative ${sizeMap[size]} ${
        isSettings ? 'rounded-xl' : 'rounded-lg'
      } overflow-hidden
                 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                 transition-all duration-200`}
      style={{
        backgroundColor: checked ? color : 'transparent',
        border: `2px solid ${checked ? color : isSettings ? '#4B5563' : '#374151'}`,
      }}
    >
      {/* Checkmark */}
      <motion.div
        initial={false}
        animate={{
          pathLength: checked ? 1 : 0,
          opacity: checked ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full p-1 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M20 6L9 17L4 12"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
        </svg>
      </motion.div>

      {/* Background ripple effect */}
      <motion.div
        initial={false}
        animate={{
          scale: checked ? [0.8, 1.1, 1] : 1,
          opacity: checked ? [0, 0.2, 0] : 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className={`absolute inset-0 ${isSettings ? 'rounded-xl' : 'rounded-lg'}`}
        style={{ backgroundColor: color }}
      />

      {/* Hover ring effect */}
      <motion.div
        initial={false}
        animate={{
          scale: checked ? 1 : 0.9,
          opacity: checked ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className={`absolute inset-0 ${
          isSettings ? 'rounded-xl' : 'rounded-lg'
        } ring-2 ring-offset-2`}
        style={{ ringColor: color }}
      />

      {/* Settings variant specific animations */}
      {isSettings && (
        <motion.div
          initial={false}
          animate={{
            opacity: checked ? 1 : 0,
            scale: checked ? 1 : 0.5,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-indigo-600/20"
        />
      )}
    </motion.button>
  );
};