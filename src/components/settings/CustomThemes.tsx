import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Lock } from 'lucide-react';
import { THEMES } from '../../store/themeStore';
import { usePremiumStore } from '../../store/premiumStore';
import { useThemeStore } from '../../store/themeStore';
import toast from 'react-hot-toast';

const ThemePreview: React.FC<{ theme: typeof THEMES[keyof typeof THEMES]; isSelected: boolean }> = ({ 
  theme, 
  isSelected 
}) => {
  return (
    <div className="relative h-32 rounded-lg overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: theme.colors.background }}
        initial={false}
        animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
      >
        {/* Theme-specific animations */}
        {theme.animation.type === 'gradient' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br opacity-30"
            style={{
              backgroundImage: `linear-gradient(45deg, ${theme.animation.colors[0]}, ${theme.animation.colors[1]})`
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
        )}

        {theme.animation.type === 'stars' && (
          <div className="absolute inset-0">
            {Array.from({ length: theme.animation.density }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}

        {theme.animation.type === 'bubbles' && (
          <div className="absolute inset-0">
            {Array.from({ length: theme.animation.count }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  backgroundColor: theme.animation.color,
                  width: theme.animation.size,
                  height: theme.animation.size,
                }}
                animate={{
                  y: [0, -200],
                  x: [0, Math.sin(Math.random() * Math.PI * 2) * 50],
                  opacity: [0.2, 0.8, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                }}
              />
            ))}
          </div>
        )}

        {theme.animation.type === 'waves' && (
          <>
            {theme.animation.colors.map((color, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(45deg, ${color} 0%, transparent 70%)`,
                  opacity: 0.2,
                }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 8 / theme.animation.speed,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </>
        )}

        {theme.animation.type === 'grid' && (
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(${theme.animation.color}22 1px, transparent 1px),
                  linear-gradient(90deg, ${theme.animation.color}22 1px, transparent 1px)
                `,
                backgroundSize: `${theme.animation.size * 20}px ${theme.animation.size * 20}px`,
              }}
            />
            
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(${theme.animation.color}22 1px, transparent 1px),
                  linear-gradient(90deg, ${theme.animation.color}22 1px, transparent 1px)
                `,
                backgroundSize: `${theme.animation.size * 20}px ${theme.animation.size * 20}px`,
              }}
              animate={{
                x: [-20, 0],
                y: [-20, 0],
              }}
              transition={{
                duration: 3 / theme.animation.speed,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${theme.animation.color}40 0%, transparent 50%)`,
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        )}

        {theme.animation.type === 'rays' && (
          <>
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 120%, ${theme.animation.colors[0]} 0%, transparent 70%)`,
                opacity: 0.3,
              }}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(${45 + i * 30}deg, ${theme.animation.colors[i % 2]} 0%, transparent 70%)`,
                  opacity: 0.2,
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </>
        )}

        {/* Theme Content Preview */}
        <div className="absolute inset-0 p-4 flex flex-col">
          <div 
            className="h-2 w-24 rounded"
            style={{ backgroundColor: theme.colors.primary }}
          />
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="w-full h-12 rounded"
              style={{ backgroundColor: theme.colors.card }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const CustomThemes: React.FC = () => {
  const { hasFeature, isFeatureEnabled } = usePremiumStore();
  const { setTheme, currentTheme } = useThemeStore();

  const handleThemeSelect = (themeId: string) => {
    const theme = THEMES[themeId as keyof typeof THEMES];
    if (!theme) return;

    if (theme.premium) {
      const hasCustomThemes = hasFeature('custom_themes');
      const isEnabled = isFeatureEnabled('custom_themes');

      if (!hasCustomThemes) {
        toast((t) => (
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="font-medium">Premium Theme</p>
              <p className="text-sm text-gray-500">
                Unlock custom themes in the Premium Store
              </p>
            </div>
          </div>
        ));
        return;
      }

      if (!isEnabled) {
        toast((t) => (
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="font-medium">Theme Locked</p>
              <p className="text-sm text-gray-500">
                Enable custom themes in Premium Features
              </p>
            </div>
          </div>
        ));
        return;
      }
    }

    setTheme(themeId);
    toast.success(`${theme.name} theme applied`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Palette className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-medium text-white">Theme Selection</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.values(THEMES).map((theme) => {
          const isSelected = currentTheme === theme.id;
          const isPremium = theme.premium;

          return (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeSelect(theme.id)}
              className={`relative rounded-xl transition-all overflow-hidden ${
                isSelected
                  ? 'ring-2 ring-indigo-500'
                  : 'ring-1 ring-gray-700 hover:ring-gray-600'
              }`}
            >
              <ThemePreview theme={theme} isSelected={isSelected} />

              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {theme.name}
                  </span>
                  {isPremium && (
                    <div className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded-full">
                      Premium
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};