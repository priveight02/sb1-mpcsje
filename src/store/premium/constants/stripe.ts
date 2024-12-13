export const STRIPE_PRODUCT_LINKS = {
  starter: 'https://buy.stripe.com/aEU3fHcBI2ym4IE8wJ',
  premium: 'https://buy.stripe.com/6oE17zeJQc8W0sodR2',
  elite: 'https://buy.stripe.com/6oE8A17hofl8eje4gu',
  ultimate: 'https://buy.stripe.com/4gw9E53182ymb728wL'
} as const;

export const STRIPE_CONFIG = {
  mode: 'payment' as const,
  billingAddressCollection: 'auto' as const,
  allowedCountries: ['US', 'CA', 'GB', 'AU', 'FR', 'DE'],
  currency: 'usd',
  successUrl: `${window.location.origin}/purchase/success`,
  cancelUrl: `${window.location.origin}/purchase/cancel`
};