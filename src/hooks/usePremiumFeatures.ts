import { usePremiumStore } from '../store/premiumStore';
import { useEffect, useState } from 'react';

export const usePremiumFeatures = () => {
  const hasFeature = usePremiumStore((state) => state.hasFeature);
  const isFeatureEnabled = usePremiumStore((state) => state.isFeatureEnabled);
  
  const [features, setFeatures] = useState({
    hasAdvancedAnalytics: false,
    hasUnlimitedBattles: false,
    hasCustomThemes: false,
    hasPrioritySupport: false,
    hasExtendedHistory: false,
    hasSmartReminders: false,
    isAdvancedAnalyticsEnabled: false,
    isUnlimitedBattlesEnabled: false,
    isCustomThemesEnabled: false,
    isPrioritySupportEnabled: false,
    isExtendedHistoryEnabled: false,
    isSmartRemindersEnabled: false
  });

  useEffect(() => {
    setFeatures({
      hasAdvancedAnalytics: hasFeature('advanced_analytics'),
      hasUnlimitedBattles: hasFeature('unlimited_battles'),
      hasCustomThemes: hasFeature('custom_themes'),
      hasPrioritySupport: hasFeature('priority_support'),
      hasExtendedHistory: hasFeature('extended_history'),
      hasSmartReminders: hasFeature('smart_reminders'),
      isAdvancedAnalyticsEnabled: isFeatureEnabled('advanced_analytics'),
      isUnlimitedBattlesEnabled: isFeatureEnabled('unlimited_battles'),
      isCustomThemesEnabled: isFeatureEnabled('custom_themes'),
      isPrioritySupportEnabled: isFeatureEnabled('priority_support'),
      isExtendedHistoryEnabled: isFeatureEnabled('extended_history'),
      isSmartRemindersEnabled: isFeatureEnabled('smart_reminders')
    });
  }, [hasFeature, isFeatureEnabled]);

  return features;
};