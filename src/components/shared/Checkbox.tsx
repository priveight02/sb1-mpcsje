import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label className="inline-flex items-center">
      <div className="relative">
        <motion.button
          type="button"
          onClick={() => !disabled && onChange(!checked)}
          className={`w-5 h-5 rounded-md border-2 transition-colors duration-200 
                   ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                   ${checked 
                     ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500' 
                     : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-400'
                   }`}
          whileHover={!disabled ? { scale: 1.05 } : undefined}
          whileTap={!disabled ? { scale: 0.95 } : undefined}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      {label && (
        <span className={`ml-2 text-sm ${
          disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {label}
        </span>
      )}
    </label>
  );
};