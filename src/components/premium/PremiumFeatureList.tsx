import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Trophy, Palette, Shield, Clock, Bell } from 'lucide-react';
import { usePremiumStore, PREMIUM_FEATURES } from '../../store/premiumStore';
import { PremiumFeatureCard } from '../store/PremiumFeatureCard';

export const PremiumFeatureList: React.FC = () => {
  const { unlockFeature, hasFeature, getAvailablePoints } = usePremiumStore();
  const availablePoints = getAvailablePoints();

  const featureIcons = {
    advanced_analytics: Brain,
    unlimited_battles: Trophy,
    custom_themes: Palette,
    priority_support: Shield,
    extended_history: Clock,
    smart_reminders: Bell,
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PREMIUM_FEATURES.map((feature) => {
          const Icon = featureIcons[feature.id as keyof typeof featureIcons];
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PremiumFeatureCard
                feature={{ ...feature, icon: Icon }}
                onUnlock={() => unlockFeature(feature.id)}
                isUnlocked={hasFeature(feature.id)}
                availablePoints={availablePoints}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};