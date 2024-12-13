export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiredPoints: number;
  status: 'locked' | 'unlocked' | 'active';
}

export interface PremiumPackage {
  id: string;
  title: string;
  points: number;
  price: string;
  description: string;
  color: string;
  perks: string[];
  popular?: boolean;
  featured?: boolean;
  limitedTime?: boolean;
  discount?: number;
  originalPrice?: string;
  stripeLink: string;
}

export interface PurchaseRecord {
  id: string;
  packageId: string;
  points: number;
  date: string;
  userId: string;
  status: 'pending' | 'completed' | 'failed';
  sessionId?: string;
}

export interface PremiumState {
  purchasedFeatures: string[];
  enabledFeatures: string[];
  availablePoints: number;
  purchaseHistory: PurchaseRecord[];
  activeFeatures: PremiumFeature[];
  lastSyncTimestamp: string | null;
}

export interface PremiumStore extends PremiumState {
  addPoints: (points: number) => Promise<void>;
  unlockFeature: (featureId: string) => boolean;
  toggleFeature: (featureId: string) => void;
  hasFeature: (featureId: string) => boolean;
  isFeatureEnabled: (featureId: string) => boolean;
  getFeatureStatus: (featureId: string) => PremiumFeature['status'];
  getAvailablePoints: () => number;
  recordPurchase: (packageId: string, points: number, sessionId?: string) => Promise<boolean>;
  syncPurchases: () => Promise<void>;
  checkPendingPurchase: () => Promise<void>;
}