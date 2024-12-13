import confetti from 'canvas-confetti';

export const triggerCompletionConfetti = () => {
  // First burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  });

  // Side bursts after a small delay
  setTimeout(() => {
    // Left burst
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#4F46E5', '#10B981', '#F59E0B'],
    });
    // Right burst
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#EF4444', '#8B5CF6', '#EC4899'],
    });
  }, 200);
};