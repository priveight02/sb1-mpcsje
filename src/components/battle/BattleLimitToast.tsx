import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Trophy } from 'lucide-react';

interface BattleLimitToastProps {
  type: 'limit' | 'remaining';
  onStoreClick: () => void;
  onDismiss: () => void;
}

export const BattleLimitToast: React.FC<BattleLimitToastProps> = ({
  type,
  onStoreClick,
  onDismiss
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 bg-gray-800 p-4 rounded-lg shadow-lg"
    >
      <div className="mt-1">
        {type === 'limit' ? (
          <Lock className="w-5 h-5 text-indigo-400" />
        ) : (
          <Trophy className="w-5 h-5 text-yellow-400" />
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium text-white mb-1">
          {type === 'limit' 
            ? 'Weekly Battle Limit Reached for Non-Premium Users'
            : 'Battle Created Successfully'
          }
        </h3>
        <p className="text-sm text-gray-400 mb-3">
          {type === 'limit'
            ? 'Upgrade to Premium for unlimited battles'
            : 'You have reached your weekly battle limit (2/2)'
          }
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              onStoreClick();
              onDismiss();
            }}
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
          >
            Upgrade to Premium
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-gray-400 text-sm hover:text-white"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
};