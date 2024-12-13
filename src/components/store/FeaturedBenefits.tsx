import React from 'react';
import { Target, Shield, Infinity, Clock } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Advanced Analytics',
    description: 'Deep insights into your habits'
  },
  {
    icon: Shield,
    title: 'Premium Support',
    description: 'Priority assistance when needed'
  },
  {
    icon: Infinity,
    title: 'Unlimited Battles',
    description: 'Create and join unlimited battles'
  },
  {
    icon: Clock,
    title: 'Extended History',
    description: 'Access your complete history'
  }
];

export const FeaturedBenefits: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gray-900/50">
      {features.map(({ icon: Icon, title, description }) => (
        <div key={title} className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-indigo-600/20 
                        flex items-center justify-center">
            <Icon className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      ))}
    </div>
  );
};