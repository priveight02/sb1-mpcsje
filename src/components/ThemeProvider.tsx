import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { currentTheme } = useThemeStore();

  // Theme-specific animations
  const animations = {
    default: {
      background: (
        <motion.div
          className="fixed inset-0 pointer-events-none bg-gradient-to-br from-gray-900 to-gray-800"
          animate={{
            opacity: [0.5, 0.6, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ),
    },
    cosmic: {
      background: (
        <>
          {/* Star field */}
          <div className="fixed inset-0 pointer-events-none">
            {Array.from({ length: 100 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 2 + 1,
                  height: Math.random() * 2 + 1,
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
          {/* Nebula effect */}
          <motion.div
            className="fixed inset-0 pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #EC4899 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      ),
    },
    ocean: {
      background: (
        <>
          {/* Floating bubbles */}
          <div className="fixed inset-0 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 4 + 2,
                  height: Math.random() * 4 + 2,
                  backgroundColor: '#06B6D4',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.3,
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
          {/* Deep water gradient */}
          <motion.div
            className="fixed inset-0 pointer-events-none opacity-20"
            style={{
              background: 'linear-gradient(45deg, #06B6D4, #0891B2)',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'mirror',
            }}
          />
        </>
      ),
    },
    aurora: {
      background: (
        <>
          {/* Aurora waves */}
          {['#10B981', '#06B6D4', '#8B5CF6'].map((color, i) => (
            <motion.div
              key={i}
              className="fixed inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(45deg, ${color} 0%, transparent 70%)`,
                opacity: 0.2,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </>
      ),
    },
    neon: {
      background: (
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(#F43F5E22 1px, transparent 1px),
                linear-gradient(90deg, #F43F5E22 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
            animate={{
              x: [-20, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #F43F5E44, transparent)',
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
      ),
    },
    golden: {
      background: (
        <>
          {/* Sun rays */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 120%, #F59E0B 0%, transparent 70%)`,
              opacity: 0.2,
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Light rays */}
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="fixed inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(${45 + i * 30}deg, #F59E0B 0%, transparent 70%)`,
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
      ),
    },
    royal: {
      background: (
        <>
          {/* Star field */}
          <div className="fixed inset-0 pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 2 + 1,
                  height: Math.random() * 2 + 1,
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
          {/* Royal gradient */}
          <motion.div
            className="fixed inset-0 pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #8B5CF6 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      ),
    },
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          {animations[currentTheme as keyof typeof animations]?.background}
        </AnimatePresence>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};