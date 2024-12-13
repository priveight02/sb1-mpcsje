import React from 'react';
import { Share2, Users, Link2 } from 'lucide-react';
import { SettingsCard } from '../SettingsCard';

interface ShareSectionProps {
  onShowShareHabits: () => void;
}

export const ShareSection: React.FC<ShareSectionProps> = ({ onShowShareHabits }) => {
  return (
    <SettingsCard
      icon={Link2}
      title="Share Habits"
      description="Share your habits with friends and import shared habits"
    >
      <button
        onClick={onShowShareHabits}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-lg
                 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400
                 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
      >
        <Share2 className="w-5 h-5" />
        <span className="font-medium">Share & Import Habits</span>
      </button>
    </SettingsCard>
  );
};