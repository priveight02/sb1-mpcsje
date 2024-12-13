import React from 'react';
import { Gem, X } from 'lucide-react';

interface StoreHeaderProps {
  availablePoints: number;
  onClose: () => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ availablePoints, onClose }) => {
  return (
    <div className="p-6 border-b border-gray-700">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Gem className="w-6 h-6 text-indigo-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Premium Store</h2>
            <p className="text-gray-400">Unlock exclusive features and rewards</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-lg bg-gray-700">
            <span className="text-indigo-400 font-medium">
              {availablePoints.toLocaleString()} points
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg 
                     hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};