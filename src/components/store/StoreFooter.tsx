import React from 'react';
import { Shield } from 'lucide-react';

export const StoreFooter: React.FC = () => {
  return (
    <div className="p-4 bg-gray-900/50 border-t border-gray-700">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Secure payments powered by Stripe
        </p>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">256-bit encryption</span>
        </div>
      </div>
    </div>
  );
};