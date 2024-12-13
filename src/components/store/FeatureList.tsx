import React from 'react';
import { motion } from 'framer-motion';
import { PREMIUM_FEATURES } from '../../store/premiumStore';
import { PremiumFeatureCard } from './PremiumFeatureCard';

interface FeatureListProps {
  availablePoints: number;
}

export const FeatureList: React.FC<FeatureListProps> = ({ availablePoints }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {PREMIUM_FEATURES.map((feature) => (
        <motion.div
          key={feature.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PremiumFeatureCard
            feature={feature}
            availablePoints={availablePoints}
          />
        </motion.div>
      ))}
    </div>
  );
};