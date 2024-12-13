import React from 'react';
import { Palette, Settings } from 'lucide-react';
import { SettingsCard } from '../SettingsCard';
import { PremiumFeatureWrapper } from '../../premium/PremiumFeatureWrapper';
import { CustomThemes } from '../CustomThemes';

export const ThemeSection: React.FC = () => {
  return (
    <SettingsCard
      icon={Settings}
      title="Appearance"
      description="Customize your app theme and appearance"
    >
      <PremiumFeatureWrapper
        featureId="custom_themes"
        fallback={
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-indigo-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Custom Themes</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Unlock premium themes and customization options
            </p>
          </div>
        }
      >
        <CustomThemes />
      </PremiumFeatureWrapper>
    </SettingsCard>
  );
};