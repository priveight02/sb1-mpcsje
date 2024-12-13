import { PremiumFeature } from '../types';

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Access detailed habit statistics and AI-powered predictions',
    enabled: false,
    requiredPoints: 1000,
    status: 'locked'
  },
  {
    id: 'unlimited_battles',
    name: 'Unlimited Battles',
    description: 'Create and join unlimited habit battles with friends',
    enabled: false,
    requiredPoints: 2000,
    status: 'locked'
  },
  {
    id: 'custom_themes',
    name: 'Custom Themes',
    description: 'Unlock premium themes and customization options',
    enabled: false,
    requiredPoints: 1500,
    status: 'locked'
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Get priority assistance and feature requests',
    enabled: false,
    requiredPoints: 3000,
    status: 'locked'
  },
  {
    id: 'extended_history',
    name: 'Extended History',
    description: 'Access your complete habit history and insights',
    enabled: false,
    requiredPoints: 2500,
    status: 'locked'
  },
  {
    id: 'smart_reminders',
    name: 'Smart Reminders',
    description: 'AI-powered reminder suggestions based on your patterns',
    enabled: false,
    requiredPoints: 2000,
    status: 'locked'
  },
  {
    id: 'habit_insights',
    name: 'Habit Insights',
    description: 'Deep dive into your habit formation patterns',
    enabled: false,
    requiredPoints: 1800,
    status: 'locked'
  },
  {
    id: 'data_export',
    name: 'Data Export',
    description: 'Export your habit data in various formats',
    enabled: false,
    requiredPoints: 1200,
    status: 'locked'
  }
];