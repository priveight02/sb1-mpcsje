export { PREMIUM_FEATURES } from './features';
export { PREMIUM_PACKAGES } from './packages';
export { STRIPE_PRODUCT_LINKS, STRIPE_CONFIG } from './stripe';

// Feature IDs for type safety
export const FEATURE_IDS = {
  ADVANCED_ANALYTICS: 'advanced_analytics',
  UNLIMITED_BATTLES: 'unlimited_battles',
  CUSTOM_THEMES: 'custom_themes',
  PRIORITY_SUPPORT: 'priority_support',
  EXTENDED_HISTORY: 'extended_history',
  SMART_REMINDERS: 'smart_reminders',
  HABIT_INSIGHTS: 'habit_insights',
  DATA_EXPORT: 'data_export'
} as const;

// Package IDs for type safety
export const PACKAGE_IDS = {
  STARTER: 'starter',
  PREMIUM: 'premium',
  ELITE: 'elite',
  ULTIMATE: 'ultimate'
} as const;

// Points thresholds for different tiers
export const POINTS_THRESHOLDS = {
  BRONZE: 1000,
  SILVER: 5000,
  GOLD: 10000,
  PLATINUM: 25000,
  DIAMOND: 50000
} as const;

// Feature categories
export const FEATURE_CATEGORIES = {
  ANALYTICS: 'analytics',
  CUSTOMIZATION: 'customization',
  SOCIAL: 'social',
  SUPPORT: 'support',
  TOOLS: 'tools'
} as const;