import React from 'react';
import { Trash2, Database } from 'lucide-react';
import { SettingsCard } from '../SettingsCard';
import toast from 'react-hot-toast';

interface DataSectionProps {
  onClearData: () => void;
}

export const DataSection: React.FC<DataSectionProps> = ({ onClearData }) => {
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      onClearData();
      toast.success('All data has been cleared');
    }
  };

  return (
    <SettingsCard
      icon={Database}
      title="Data Management"
      description="Manage your app data"
    >
      <button
        onClick={handleClearData}
        className="w-full flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 
                 rounded-lg p-2 transition-colors text-red-600 dark:text-red-400"
      >
        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
          <Trash2 className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-medium">Clear All Data</h3>
          <p className="text-sm text-red-500 dark:text-red-400">
            This action cannot be undone
          </p>
        </div>
      </button>
    </SettingsCard>
  );
};