import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useRewardStore } from '../../store/rewardStore';
import confetti from 'canvas-confetti';

const sizeMap = {
  small: 'w-12 h-12',
  medium: 'w-20 h-20',
  large: 'w-28 h-28',
};

// Random animation patterns
const getRandomAnimation = () => {
  const patterns = [
    {
      y: [0, -20, 0],
      x: [0, 15, -15, 0],
      rotate: [0, 10, -10, 0],
    },
    {
      y: [0, -30, -15, -25, 0],
      x: [-20, 20, -10, 10, 0],
      rotate: [-15, 15, -5, 5, 0],
    },
    {
      y: [0, -15, -25, -10, 0],
      scale: [1, 1.1, 0.95, 1.05, 1],
      rotate: [0, -15, 15, -5, 0],
    },
    {
      y: [0, -20, -10, -25, 0],
      x: [10, -10, 15, -15, 0],
      scale: [1, 1.15, 0.9, 1.1, 1],
    },
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
};

const getRandomDuration = () => {
  return 1.5 + Math.random() * 1; // Random duration between 1.5 and 2.5 seconds
};

const getRandomDelay = () => {
  return Math.random() * 0.5; // Random delay between 0 and 0.5 seconds
};

interface ParticleProps {
  x: number;
  y: number;
  color: string;
}

const Particle: React.FC<ParticleProps> = ({ x, y, color }) => {
  const angle = Math.random() * Math.PI * 2;
  const velocity = 5 + Math.random() * 10;
  const distance = 100 + Math.random() * 100;

  return (
    <motion.div
      initial={{ 
        x, 
        y,
        scale: 1,
        opacity: 1 
      }}
      animate={{ 
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        scale: 0,
        opacity: 0
      }}
      transition={{ 
        duration: 0.8 + Math.random() * 0.4,
        ease: [0.32, 0, 0.67, 0]
      }}
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
};

const BubbleExplosion: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => {
  const particles = Array.from({ length: 12 }, (_, i) => (
    <Particle key={i} x={x} y={y} color={color} />
  ));

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 1 }}
      animate={{ scale: 1.2, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [1, 2] }}
        transition={{ duration: 0.3 }}
        className="absolute w-full h-full rounded-full"
        style={{ 
          backgroundColor: color,
          opacity: 0.3,
          filter: 'blur(10px)',
          transform: 'translate(-50%, -50%)'
        }}
      />
      {particles}
    </motion.div>
  );
};

const Bubble: React.FC<{
  bubble: any;
  onPop: (e: React.MouseEvent, bubble: any) => void;
}> = ({ bubble, onPop }) => {
  const controls = useAnimation();
  const [pattern] = useState(getRandomAnimation());
  const [duration] = useState(getRandomDuration());
  const [delay] = useState(getRandomDelay());

  useEffect(() => {
    const animate = async () => {
      await controls.start({
        ...pattern,
        transition: {
          duration,
          repeat: Infinity,
          repeatType: "reverse" as const,
          ease: "easeInOut",
          delay,
        },
      });
    };
    animate();
  }, []);

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={controls}
      exit={{ 
        scale: [1, 1.2, 0],
        opacity: [1, 1, 0],
        transition: { duration: 0.3 }
      }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: '0 0 20px rgba(255,255,255,0.3)'
      }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'absolute',
        left: bubble.position.x,
        top: bubble.position.y,
        backgroundColor: bubble.color,
      }}
      className={`${sizeMap[bubble.size]} rounded-full shadow-lg pointer-events-auto
                 flex items-center justify-center text-white font-bold
                 cursor-pointer transition-all duration-200
                 backdrop-blur-sm bg-opacity-90 overflow-hidden
                 before:content-[''] before:absolute before:inset-0 
                 before:bg-gradient-to-br before:from-white/20 before:to-transparent`}
      onClick={(e) => onPop(e, bubble)}
    >
      <motion.span
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        className={`text-${bubble.size === 'small' ? 'sm' : bubble.size === 'medium' ? 'base' : 'lg'}
                   font-bold text-white drop-shadow-lg`}
      >
        +{bubble.points}
      </motion.span>
    </motion.button>
  );
};

export const BubbleRewards: React.FC = () => {
  const { currentBubbles, claimBubble, startSession, updateSessionTime } = useRewardStore();
  const [explosions, setExplosions] = useState<Array<{ id: string; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    startSession();
    const interval = setInterval(() => {
      updateSessionTime();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBubblePop = (e: React.MouseEvent, bubble: any) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    claimBubble(bubble.id);

    // Add explosion effect
    const explosionId = crypto.randomUUID();
    setExplosions(prev => [...prev, { id: explosionId, x, y, color: bubble.color }]);
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== explosionId));
    }, 1000);

    // Enhanced confetti effect
    const duration = 0.8;
    const particleCount = Math.floor(bubble.points / 5);
    
    // First burst
    confetti({
      particleCount: particleCount,
      spread: 80,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      colors: [bubble.color, '#ffffff'],
      gravity: 0.8,
      scalar: 1.2,
      drift: 0,
      ticks: 200
    });

    // Secondary burst with different parameters
    setTimeout(() => {
      confetti({
        particleCount: particleCount / 2,
        spread: 45,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: [bubble.color],
        gravity: 0.4,
        scalar: 0.8,
        drift: 1,
        ticks: 150
      });
    }, duration * 200);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {currentBubbles.map((bubble) => (
          <Bubble
            key={bubble.id}
            bubble={bubble}
            onPop={handleBubblePop}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {explosions.map(({ id, x, y, color }) => (
          <BubbleExplosion key={id} x={x} y={y} color={color} />
        ))}
      </AnimatePresence>
    </div>
  );
};