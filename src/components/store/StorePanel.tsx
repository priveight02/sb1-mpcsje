import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Gem, Shield, Store, Sparkles, Star, Crown, Zap,
  Package 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { usePremiumStore, PREMIUM_PACKAGES, PREMIUM_FEATURES } from '../../store/premiumStore';
import { PremiumFeatureCard } from './PremiumFeatureCard';
import { PurchaseSuccessModal } from './PurchaseSuccessModal';
import { StoreHeader } from './StoreHeader';
import { StoreTabs } from './StoreTabs';
import { FeaturedBenefits } from './FeaturedBenefits';
import { PackageList } from './PackageList';
import { FeatureList } from './FeatureList';
import { StoreFooter } from './StoreFooter';
import toast from 'react-hot-toast';

interface StorePanelProps {
  onClose: () => void;
}

export const StorePanel: React.FC<StorePanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'features'>('packages');
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [purchasedPoints, setPurchasedPoints] = useState(0);
  const { user } = useAuthStore();
  const { getAvailablePoints } = usePremiumStore();

  const availablePoints = getAvailablePoints();

  // Check URL parameters for successful purchase
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('stripe_success');
    const pendingPurchase = localStorage.getItem('pendingPurchase');
    
    if (success === 'true' && pendingPurchase) {
      const { points } = JSON.parse(pendingPurchase);
      setPurchasedPoints(points);
      setShowPurchaseSuccess(true);
      localStorage.removeItem('pendingPurchase');
      
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handlePurchaseSuccess = (points: number) => {
    setPurchasedPoints(points);
    setShowPurchaseSuccess(true);
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
      <StoreHeader 
        availablePoints={availablePoints} 
        onClose={onClose} 
      />

      <StoreTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <FeaturedBenefits />

      <AnimatePresence mode="wait">
        {activeTab === 'features' ? (
          <motion.div
            key="features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            <FeatureList availablePoints={availablePoints} />
          </motion.div>
        ) : (
          <motion.div
            key="packages"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            <PackageList onPurchaseSuccess={handlePurchaseSuccess} />
          </motion.div>
        )}
      </AnimatePresence>

      <StoreFooter />

      <PurchaseSuccessModal
        show={showPurchaseSuccess}
        points={purchasedPoints}
        onClose={() => setShowPurchaseSuccess(false)}
      />
    </div>
  );
};