import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Trophy, Palette, Shield, Clock, Bell } from 'lucide-react';
import { usePremiumStore } from '../../store/premiumStore';

export const PremiumFeatureOverview: React.FC = () => {
  const { getAvailablePoints } = usePremiumStore();
  const points = getAvailablePoints();

  const features = [
    {
      icon: Brain,
      name: 'Advanced Analytics',
      description: 'Deep insights into your habits',
      points: 1000,
    },
    {
      icon: Trophy,
      name: 'Unlimited Battles',
      description: 'Create and join unlimited battles',
      points: 2000,
    },
    {
      icon: Palette,
      name: 'Custom Themes',
      description: 'Personalize your experience',
      points: 1500,
    },
    {
      icon: Shield,
      name: 'Priority Support',
      description: 'Get help when you need it',
      points: 3000,
    },
    {
      icon: Clock,
      name: 'Extended History',
      description: 'Track your complete journey',
      points: 2500,
    },
    {
      icon: Bell,
      name: 'Smart Reminders',
      description: 'AI-powered notifications',
      points: 2000,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Premium Features</h2>
        <p className="text-gray-400">
          You have {points.toLocaleString()} points available
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-indigo-600/20">
                <feature.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">{feature.name}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            </div>
            <div className="text-sm text-indigo-400">
              {feature.points.toLocaleString()} points
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};