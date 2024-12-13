import React from 'react';
import { motion } from 'framer-motion';
import { Package, Star, Crown, Sparkles } from 'lucide-react';
import { PREMIUM_PACKAGES, STRIPE_PRODUCT_LINKS } from '../../store/premiumStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface PackageListProps {
  onPurchaseSuccess: (points: number) => void;
}

export const PackageList: React.FC<PackageListProps> = ({ onPurchaseSuccess }) => {
  const { user } = useAuthStore();

  const getPackageColors = (packageId: string) => {
    switch (packageId) {
      case 'starter':
        return {
          background: 'from-blue-500/20 to-blue-600/20',
          border: 'border-blue-500/30',
          icon: 'bg-blue-500/20 text-blue-400',
          button: 'from-blue-500 to-blue-600',
          points: 'text-blue-400'
        };
      case 'premium':
        return {
          background: 'from-purple-500/20 to-purple-600/20',
          border: 'border-purple-500/30',
          icon: 'bg-purple-500/20 text-purple-400',
          button: 'from-purple-500 to-purple-600',
          points: 'text-purple-400'
        };
      case 'elite':
        return {
          background: 'from-amber-500/20 to-yellow-600/20',
          border: 'border-yellow-500/30',
          icon: 'bg-yellow-500/20 text-yellow-400',
          button: 'from-amber-500 to-yellow-600',
          points: 'text-yellow-400'
        };
      case 'ultimate':
        return {
          background: 'from-emerald-500/20 to-teal-600/20',
          border: 'border-emerald-500/30',
          icon: 'bg-emerald-500/20 text-emerald-400',
          button: 'from-emerald-500 to-teal-600',
          points: 'text-emerald-400'
        };
      default:
        return {
          background: 'from-gray-500/20 to-gray-600/20',
          border: 'border-gray-500/30',
          icon: 'bg-gray-500/20 text-gray-400',
          button: 'from-gray-500 to-gray-600',
          points: 'text-gray-400'
        };
    }
  };

  const handlePurchase = (packageId: string) => {
    if (!user) {
      toast.error('Please sign in to make a purchase');
      return;
    }

    localStorage.setItem('pendingPurchase', JSON.stringify({
      packageId,
      userId: user.uid,
      timestamp: Date.now()
    }));

    window.location.href = STRIPE_PRODUCT_LINKS[packageId as keyof typeof STRIPE_PRODUCT_LINKS];
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {PREMIUM_PACKAGES.map((pkg) => {
        const colors = getPackageColors(pkg.id);
        const Icon = pkg.id === 'ultimate' ? Sparkles :
                    pkg.id === 'elite' ? Crown :
                    pkg.id === 'premium' ? Star : Package;

        return (
          <motion.div
            key={pkg.id}
            whileHover={{ scale: 1.03 }}
            className={`relative p-6 rounded-xl cursor-pointer bg-gradient-to-br ${colors.background} 
                       border ${colors.border} overflow-hidden`}
          >
            {/* Badge Icon */}
            {(pkg.popular || pkg.featured || pkg.limitedTime) && (
              <div className="absolute -top-2 -right-2">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Icon 
                    className={`w-8 h-8 ${
                      pkg.popular ? 'text-purple-400' :
                      pkg.featured ? 'text-yellow-400' :
                      'text-emerald-400'
                    }`}
                  />
                </motion.div>
              </div>
            )}

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${colors.icon}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{pkg.title}</h3>
                  <p className={`text-sm ${colors.points}`}>
                    {pkg.points.toLocaleString()} points
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl font-bold text-white">
                  ${pkg.price}
                </div>
                {pkg.discount && (
                  <>
                    <div className="text-sm line-through text-white/40">
                      ${pkg.originalPrice}
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${colors.icon}`}>
                      {pkg.discount}% OFF
                    </div>
                  </>
                )}
              </div>

              {/* Perks */}
              <div className="space-y-2 mb-6">
                {pkg.perks.map((perk, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.points}`} />
                    <span className="text-sm text-white/80">{perk}</span>
                  </div>
                ))}
              </div>

              {/* Purchase Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePurchase(pkg.id)}
                className={`w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r 
                           ${colors.button} shadow-lg relative overflow-hidden group`}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r 
                              from-transparent via-white to-transparent -translate-x-full 
                              group-hover:translate-x-full transition-all duration-1000" />
                Purchase Now
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};