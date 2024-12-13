import { PremiumFeature, PremiumPackage } from './types';

// Stripe product links for direct checkout
export const STRIPE_PRODUCT_LINKS = {
  starter: 'https://buy.stripe.com/aEU3fHcBI2ym4IE8wJ',
  premium: 'https://buy.stripe.com/6oE17zeJQc8W0sodR2',
  elite: 'https://buy.stripe.com/6oE8A17hofl8eje4gu',
  ultimate: 'https://buy.stripe.com/4gw9E53182ymb728wL'
} as const;

// Premium features configuration
export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Access detailed habit statistics and AI-powered predictions',
    enabled: false,
    requiredPoints: 1000,
    status: 'locked',
    category: 'analytics'
  },
  {
    id: 'unlimited_battles',
    name: 'Unlimited Battles',
    description: 'Create and join unlimited habit battles with friends',
    enabled: false,
    requiredPoints: 2000,
    status: 'locked',
    category: 'social'
  },
  {
    id: 'custom_themes',
    name: 'Custom Themes',
    description: 'Unlock premium themes and customization options',
    enabled: false,
    requiredPoints: 1500,
    status: 'locked',
    category: 'customization'
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Get priority assistance and feature requests',
    enabled: false,
    requiredPoints: 3000,
    status: 'locked',
    category: 'support'
  },
  {
    id: 'extended_history',
    name: 'Extended History',
    description: 'Access your complete habit history and insights',
    enabled: false,
    requiredPoints: 2500,
    status: 'locked',
    category: 'analytics'
  },
  {
    id: 'smart_reminders',
    name: 'Smart Reminders',
    description: 'AI-powered reminder suggestions based on your patterns',
    enabled: false,
    requiredPoints: 2000,
    status: 'locked',
    category: 'tools'
  },
  {
    id: 'habit_insights',
    name: 'Habit Insights',
    description: 'Deep dive into your habit formation patterns',
    enabled: false,
    requiredPoints: 1800,
    status: 'locked',
    category: 'analytics'
  },
  {
    id: 'data_export',
    name: 'Data Export',
    description: 'Export your habit data in various formats',
    enabled: false,
    requiredPoints: 1200,
    status: 'locked',
    category: 'tools'
  },
  {
    id: 'achievement_badges',
    name: 'Achievement Badges',
    description: 'Unlock special badges for your accomplishments',
    enabled: false,
    requiredPoints: 1500,
    status: 'locked',
    category: 'customization'
  },
  {
    id: 'habit_sharing',
    name: 'Habit Sharing',
    description: 'Share and import habits with other users',
    enabled: false,
    requiredPoints: 1800,
    status: 'locked',
    category: 'social'
  }
];

// Premium packages configuration
export const PREMIUM_PACKAGES: PremiumPackage[] = [
  {
    id: 'starter',
    title: 'Starter Pack',
    points: 1000,
    price: '4.99',
    description: 'Perfect for getting started',
    color: 'from-blue-500 to-blue-600',
    perks: [
      '1,000 Premium Points',
      'Basic Analytics Access',
      'Standard Support',
      'Basic Themes'
    ],
    stripeLink: STRIPE_PRODUCT_LINKS.starter
  },
  {
    id: 'premium',
    title: 'Premium Pack',
    points: 3000,
    price: '9.99',
    description: 'Most popular choice',
    color: 'from-purple-500 to-purple-600',
    perks: [
      '3,000 Premium Points',
      'Advanced Analytics',
      'Custom Themes',
      'Priority Support',
      'Extended History'
    ],
    popular: true,
    discount: 20,
    originalPrice: '12.99',
    stripeLink: STRIPE_PRODUCT_LINKS.premium
  },
  {
    id: 'elite',
    title: 'Elite Pack',
    points: 7500,
    price: '19.99',
    description: 'For serious habit builders',
    color: 'from-yellow-500 to-yellow-600',
    perks: [
      '7,500 Premium Points',
      'All Premium Features',
      'Priority Support',
      'Exclusive Challenges',
      'Early Access Features',
      'Custom Analytics Dashboard'
    ],
    featured: true,
    stripeLink: STRIPE_PRODUCT_LINKS.elite
  },
  {
    id: 'ultimate',
    title: 'Ultimate Pack',
    points: 20000,
    price: '39.99',
    description: 'Best value for points',
    color: 'from-emerald-500 to-emerald-600',
    perks: [
      '20,000 Premium Points',
      'All Premium Features',
      'VIP Support',
      'Exclusive Content',
      'Beta Features Access',
      'Personal Success Coach',
      'Lifetime Updates'
    ],
    limitedTime: true,
    discount: 33,
    originalPrice: '59.99',
    stripeLink: STRIPE_PRODUCT_LINKS.ultimate
  }
];

// Feature categories for organization
export const FEATURE_CATEGORIES = {
  ANALYTICS: 'analytics',
  CUSTOMIZATION: 'customization',
  SOCIAL: 'social',
  SUPPORT: 'support',
  TOOLS: 'tools'
} as const;

// Points thresholds for different tiers
export const POINTS_THRESHOLDS = {
  BRONZE: 1000,
  SILVER: 5000,
  GOLD: 10000,
  PLATINUM: 25000,
  DIAMOND: 50000
} as const;

// Feature IDs for type safety
export const FEATURE_IDS = {
  ADVANCED_ANALYTICS: 'advanced_analytics',
  UNLIMITED_BATTLES: 'unlimited_battles',
  CUSTOM_THEMES: 'custom_themes',
  PRIORITY_SUPPORT: 'priority_support',
  EXTENDED_HISTORY: 'extended_history',
  SMART_REMINDERS: 'smart_reminders',
  HABIT_INSIGHTS: 'habit_insights',
  DATA_EXPORT: 'data_export',
  ACHIEVEMENT_BADGES: 'achievement_badges',
  HABIT_SHARING: 'habit_sharing'
} as const;

// Package IDs for type safety
export const PACKAGE_IDS = {
  STARTER: 'starter',
  PREMIUM: 'premium',
  ELITE: 'elite',
  ULTIMATE: 'ultimate'
} as const;

// Stripe configuration
export const STRIPE_CONFIG = {
  mode: 'payment' as const,
  billingAddressCollection: 'auto' as const,
  allowedCountries: ['US', 'CA', 'GB', 'AU', 'FR', 'DE'],
  currency: 'usd',
  successUrl: `${window.location.origin}/purchase/success`,
  cancelUrl: `${window.location.origin}/purchase/cancel`
};