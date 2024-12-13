import React from 'react';
import { useThemeStore } from '../../../store/themeStore';
import { usePremiumStore } from '../../../store/premiumStore';
import { CustomThemes } from '../CustomThemes';
import { PremiumFeatureWrapper } from '../../premium/PremiumFeatureWrapper';
import { Palette } from 'lucide-react';

export const ThemeSettings: React.FC = () => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};