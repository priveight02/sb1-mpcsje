import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Star, Crown, Sparkles } from 'lucide-react';
import { PREMIUM_PACKAGES } from '../../store/premiumStore';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger success animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Second wave
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 200);
  }, []);

  // Filter out the purchased package
  const purchasedPackageId = localStorage.getItem('lastPurchasedPackage');
  const recommendedPackages = PREMIUM_PACKAGES.filter(pkg => 
    pkg.id !== purchasedPackageId && 
    pkg.points > (PREMIUM_PACKAGES.find(p => p.id === purchasedPackageId)?.points || 0)
  );

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block"
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Thank You for Your Purchase!
          </h1>
          <p className="text-xl text-gray-400">
            Your premium features have been activated
          </p>
        </div>

        {/* Recommended Packages */}
        {recommendedPackages.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Unlock Even More Premium Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedPackages.map((pkg) => {
                const Icon = pkg.id === 'ultimate' ? Sparkles : 
                           pkg.id === 'elite' ? Crown :
                           pkg.id === 'premium' ? Star : Package;

                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800 rounded-xl p-6 relative overflow-hidden"
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${pkg.color}`} />

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg bg-opacity-20 ${pkg.color.split('from-')[1].split(' ')[0]}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {pkg.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {pkg.points.toLocaleString()} points
                          </p>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {pkg.perks.map((perk, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            {perk}
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-white">
                          ${pkg.price}
                        </div>
                        {pkg.discount && (
                          <div className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                            {pkg.discount}% OFF
                          </div>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = STRIPE_PRODUCT_LINKS[pkg.id as keyof typeof STRIPE_PRODUCT_LINKS]}
                        className={`w-full py-3 rounded-lg font-medium text-white
                                 bg-gradient-to-r ${pkg.color} relative overflow-hidden
                                 group transition-all duration-300`}
                      >
                        {/* Animated shine effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
                        Purchase Now
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Return to Dashboard */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};