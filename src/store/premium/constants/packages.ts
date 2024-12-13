import { PremiumPackage } from '../types';
import { STRIPE_PRODUCT_LINKS } from './stripe';

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