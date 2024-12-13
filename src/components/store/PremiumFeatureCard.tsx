import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { PremiumFeature } from '../../store/premiumStore';
import { usePremiumStore } from '../../store/premiumStore';
import toast from 'react-hot-toast';

interface PremiumFeatureCardProps {
  feature: PremiumFeature;
  onUnlock: () => boolean;
  isUnlocked: boolean;
  availablePoints: number;
}

export const PremiumFeatureCard: React.FC<PremiumFeatureCardProps> = ({
  feature,
  onUnlock,
  isUnlocked,
  availablePoints
}) => {
  const toggleFeature = usePremiumStore((state) => state.toggleFeature);
  const isEnabled = usePremiumStore((state) => state.isFeatureEnabled(feature.id));
  const status = usePremiumStore((state) => state.getFeatureStatus(feature.id));

  const handleClick = () => {
    if (!isUnlocked) {
      if (availablePoints < feature.requiredPoints) {
        toast.error('Not enough points to unlock this feature');
        return;
      }

      if (onUnlock()) {
        toast.success(`Successfully unlocked ${feature.name}!`);
      }
      return;
    }

    // Toggle feature if already unlocked
    toggleFeature(feature.id);
    toast.success(`${feature.name} ${isEnabled ? 'disabled' : 'enabled'}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 rounded-xl cursor-pointer transition-all ${
        status === 'active'
          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20'
          : status === 'unlocked'
          ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20'
          : 'bg-gray-700 hover:bg-gray-600'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
        {status === 'active' ? (
          <ToggleRight className="w-6 h-6 text-green-500" />
        ) : status === 'unlocked' ? (
          <ToggleLeft className="w-6 h-6 text-indigo-400" />
        ) : (
          <Lock className="w-6 h-6 text-gray-400" />
        )}
      </div>

      <p className="text-gray-300 mb-4">{feature.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400 text-sm">
            {feature.requiredPoints.toLocaleString()} points
          </div>
        </div>
        {!isUnlocked && (
          <div className={`text-sm ${
            availablePoints >= feature.requiredPoints
              ? 'text-green-400'
              : 'text-red-400'
          }`}>
            {availablePoints >= feature.requiredPoints
              ? 'Available to unlock'
              : `Need ${(feature.requiredPoints - availablePoints).toLocaleString()} more points`}
          </div>
        )}
      </div>
    </motion.div>
  );
};