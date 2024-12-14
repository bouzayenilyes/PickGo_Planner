import confetti from 'canvas-confetti';

export const triggerConfetti = (type: 'achievement' | 'pomodoro' = 'pomodoro') => {
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 10000,
  };

  const achievementConfig = {
    ...defaults,
    particleCount: 150,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#FFD700', '#FFA500', '#FF4500'], // Gold, Orange, Red-Orange
    shapes: ['star'],
  };

  const pomodoroConfig = {
    ...defaults,
    particleCount: 100,
    origin: { y: 0.7 },
    colors: ['#4CAF50', '#81C784', '#C8E6C9'], // Green shades
  };

  const config = type === 'achievement' ? achievementConfig : pomodoroConfig;

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  if (type === 'achievement') {
    // For achievements, create a more spectacular effect
    confetti({
      ...config,
      angle: randomInRange(55, 125),
    });

    // Add some delayed confetti for extra effect
    setTimeout(() => {
      confetti({
        ...config,
        angle: randomInRange(55, 125),
      });
    }, 150);
  } else {
    // For regular pomodoro completion
    confetti({
      ...config,
      angle: 90,
      origin: { x: 0.4, y: 0.7 },
    });
    confetti({
      ...config,
      angle: 90,
      origin: { x: 0.6, y: 0.7 },
    });
  }
};
