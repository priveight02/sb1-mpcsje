import React from 'react';
import { Store, Sparkles } from 'lucide-react';

interface StoreTabsProps {
  activeTab: 'packages' | 'features';
  onTabChange: (tab: 'packages' | 'features') => void;
}

export const StoreTabs: React.FC<StoreTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-2 px-6 pt-6">
      <TabButton
        active={activeTab === 'packages'}
        onClick={() => onTabChange('packages')}
        icon={Store}
        label="Point Packages"
      />
      <TabButton
        active={activeTab === 'features'}
        onClick={() => onTabChange('features')}
        icon={Sparkles}
        label="Premium Features"
      />
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.FC<{ size: number }>;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      active
        ? 'bg-indigo-600 text-white'
        : 'text-gray-400 hover:text-white hover:bg-gray-700'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);