import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { usePremiumStore } from '../../store/premiumStore';
import toast from 'react-hot-toast';

interface FeatureGateProps {
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  featureId, 
  children, 
  fallback 
}) => {
  const hasFeature = usePremiumStore((state) => state.hasFeature);
  const feature = usePremiumStore((state) => 
    state.activeFeatures.find(f => f.id === featureId)
  );

  if (hasFeature(featureId)) {
    return <>{children}</>;
  }

  const handlePremiumClick = () => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <Lock className="w-5 h-5 text-indigo-400" />
        <div>
          <p className="font-medium">Premium Feature</p>
          <p className="text-sm text-gray-500">
            Unlock this feature for {feature?.requiredPoints.toLocaleString()} points
          </p>
        </div>
      </div>
    ));
  };

  if (fallback) {
    return (
      <div onClick={handlePremiumClick} className="cursor-pointer">
        {fallback}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePremiumClick}
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