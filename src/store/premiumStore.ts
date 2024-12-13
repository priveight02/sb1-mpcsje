import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useLeaderboardStore } from './leaderboardStore';
import { PremiumStore, PremiumState } from './premium/types';
import { PREMIUM_FEATURES, PREMIUM_PACKAGES, STRIPE_PRODUCT_LINKS } from './premium/constants';
import { updateUserPoints, recordPurchaseInFirestore, getUserPremiumData, getUserPurchases } from './premium/firestore';
import { createPurchaseRecord, validatePurchase, getPendingPurchase, clearPendingPurchase, setLastPurchasedPackage } from './premium/utils';

const initialState: PremiumState = {
  purchasedFeatures: [],
  enabledFeatures: [],
  availablePoints: 0,
  purchaseHistory: [],
  activeFeatures: PREMIUM_FEATURES,
  lastSyncTimestamp: null,
};

export const usePremiumStore = create<PremiumStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addPoints: async (points: number) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          set((state) => ({
            availablePoints: state.availablePoints + points
          }));

          await updateUserPoints(user.uid, get().availablePoints);

          const leaderboard = useLeaderboardStore.getState();
          leaderboard.addPoints(user.uid, points);
        } catch (error) {
          console.error('Failed to add points:', error);
          throw error;
        }
      },

      recordPurchase: async (packageId: string, points: number, sessionId?: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return false;

        try {
          const purchase = createPurchaseRecord(packageId, points, user.uid, sessionId);
          await recordPurchaseInFirestore(purchase);

          set((state) => ({
            purchaseHistory: [...state.purchaseHistory, purchase]
          }));

          await get().addPoints(points);
          setLastPurchasedPackage(packageId);

          return true;
        } catch (error) {
          console.error('Failed to record purchase:', error);
          return false;
        }
      },

      syncPurchases: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          const userData = await getUserPremiumData(user.uid);
          const purchases = await getUserPurchases(user.uid);

          if (userData) {
            set({
              availablePoints: userData.points,
              purchasedFeatures: userData.purchasedFeatures,
              enabledFeatures: userData.enabledFeatures,
              purchaseHistory: purchases,
              lastSyncTimestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Failed to sync purchases:', error);
        }
      },

      checkPendingPurchase: async () => {
        const pendingPurchase = getPendingPurchase();
        if (!pendingPurchase) return;

        try {
          if (!validatePurchase(pendingPurchase)) {
            clearPendingPurchase();
            return;
          }

          await get().recordPurchase(
            pendingPurchase.packageId,
            pendingPurchase.points,
            pendingPurchase.sessionId
          );

          clearPendingPurchase();
        } catch (error) {
          console.error('Failed to process pending purchase:', error);
        }
      },

      unlockFeature: (featureId: string) => {
        const state = get();
        const feature = state.activeFeatures.find(f => f.id === featureId);
        
        if (!feature || state.purchasedFeatures.includes(featureId)) {
          return false;
        }

        if (state.availablePoints >= feature.requiredPoints) {
          set((state) => ({
            availablePoints: state.availablePoints - feature.requiredPoints,
            purchasedFeatures: [...state.purchasedFeatures, featureId],
            activeFeatures: state.activeFeatures.map(f =>
              f.id === featureId ? { ...f, status: 'unlocked' as const } : f
            )
          }));
          return true;
        }

        return false;
      },

      toggleFeature: (featureId: string) => {
        const isCurrentlyEnabled = get().enabledFeatures.includes(featureId);
        
        set((state) => ({
          enabledFeatures: isCurrentlyEnabled
            ? state.enabledFeatures.filter(id => id !== featureId)
            : [...state.enabledFeatures, featureId],
          activeFeatures: state.activeFeatures.map(f =>
            f.id === featureId
              ? { ...f, status: isCurrentlyEnabled ? 'unlocked' as const : 'active' as const }
              : f
          )
        }));
      },

      hasFeature: (featureId: string) => {
        return get().purchasedFeatures.includes(featureId);
      },

      isFeatureEnabled: (featureId: string) => {
        return get().enabledFeatures.includes(featureId);
      },

      getFeatureStatus: (featureId: string) => {
        const feature = get().activeFeatures.find(f => f.id === featureId);
        return feature?.status || 'locked';
      },

      getAvailablePoints: () => {
        return get().availablePoints;
      },
    }),
    {
      name: 'premium-storage',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.syncPurchases();
          state.checkPendingPurchase();
        }
      }
    }
  )
);

// Re-export constants for convenience
export { PREMIUM_FEATURES, PREMIUM_PACKAGES, STRIPE_PRODUCT_LINKS };