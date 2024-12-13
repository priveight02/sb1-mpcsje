import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { usePremiumStore } from '../../store/premiumStore';
import toast from 'react-hot-toast';

interface PremiumFeatureGateProps {
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  featureId,
  children,
  fallback,
  showUpgradePrompt = true
}) => {
  const { hasFeature, isFeatureEnabled, getAvailablePoints } = usePremiumStore();
  const availablePoints = getAvailablePoints();
  const feature = PREMIUM_FEATURES.find(f => f.id === featureId);

  // Check if feature is both unlocked and enabled
  const isUnlocked = hasFeature(featureId);
  const isEnabled = isFeatureEnabled(featureId);
  const isAccessible = isUnlocked && isEnabled;

  if (isAccessible) {
    return <>{children}</>;
  }

  const handleUpgradeClick = () => {
    if (!showUpgradePrompt) return;

    if (!isUnlocked) {
      toast((t) => (
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="font-medium">Premium Feature</p>
            <p className="text-sm text-gray-500">
              {availablePoints >= (feature?.requiredPoints || 0)
                ? 'Unlock this feature in the Premium Store'
                : `Need ${((feature?.requiredPoints || 0) - availablePoints).toLocaleString()} more points`}
            </p>
          </div>
        </div>
      ));
    } else if (!isEnabled) {
      toast((t) => (
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="font-medium">Feature Locked</p>
            <p className="text-sm text-gray-500">
              Enable this feature in Premium Features tab
            </p>
          </div>
        </div>
      ));
    }
  };

  if (fallback) {
    return (
      <div onClick={handleUpgradeClick} className="cursor-pointer">
        {fallback}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleUpgradeClick}
      className="relative p-4 rounded-lg bg-gray-800 border border-gray-700 
                 cursor-pointer group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 
                    opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-3">
        <Lock className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="font-medium text-white">{feature?.name}</h3>
          <p className="text-sm text-gray-400">{feature?.description}</p>
        </div>
      </div>
    </motion.div>
  );
};