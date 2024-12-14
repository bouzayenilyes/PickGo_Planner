interface ProductivityTip {
  id: string;
  title: string;
  description: string;
  category: 'focus' | 'energy' | 'technique' | 'environment' | 'mindset';
  condition: (state: any) => boolean;
}

export const PRODUCTIVITY_TIPS: ProductivityTip[] = [
  {
    id: 'energy_dip',
    title: 'Energy Level Alert',
    description: 'Your energy seems low. Consider taking a longer break or doing some quick exercises.',
    category: 'energy',
    condition: (state) => state.currentSession.energyLevel <= 2,
  },
  {
    id: 'distraction_high',
    title: 'High Distraction Alert',
    description: 'You seem distracted today. Try enabling Focus Mode to block distracting websites.',
    category: 'focus',
    condition: (state) => state.currentSession.distractions >= 3,
  },
  {
    id: 'optimal_hours',
    title: 'Peak Performance Time',
    description: 'This is typically your most productive time. Consider tackling important tasks now.',
    category: 'technique',
    condition: (state) => {
      const hour = new Date().getHours();
      return state.statistics.bestFocusHours.includes(hour);
    },
  },
  {
    id: 'environment_setup',
    title: 'Workspace Optimization',
    description: 'Take a moment to optimize your workspace: adjust lighting, reduce noise, and organize your desk.',
    category: 'environment',
    condition: (state) => state.currentSession.focusScore < 70,
  },
  {
    id: 'mindful_break',
    title: 'Mindful Break Reminder',
    description: 'Try some deep breathing or quick meditation during your break to refresh your mind.',
    category: 'mindset',
    condition: (state) => state.currentSession.mode.includes('Break'),
  },
  {
    id: 'work_duration_adjustment',
    title: 'Session Length Optimization',
    description: 'Based on your energy patterns, consider adjusting your work session duration.',
    category: 'technique',
    condition: (state) => state.settings.autoAdjustWorkDuration && state.currentSession.energyLevel !== 3,
  },
  {
    id: 'streak_motivation',
    title: 'Keep the Momentum',
    description: 'You're on a great streak! Just a few more pomodoros to reach your daily goal.',
    category: 'mindset',
    condition: (state) => {
      const remainingPomodoros = state.settings.dailyGoal - state.totalPomodoros;
      return remainingPomodoros > 0 && remainingPomodoros <= 3;
    },
  },
  {
    id: 'focus_zone',
    title: 'Enter the Focus Zone',
    description: 'Your focus score is high! This is the perfect time for deep work tasks.',
    category: 'focus',
    condition: (state) => state.currentSession.focusScore >= 90,
  },
];

export const getRelevantTips = (state: any): ProductivityTip[] => {
  return PRODUCTIVITY_TIPS.filter(tip => tip.condition(state));
};

export const POMODORO_TECHNIQUES = [
  {
    name: 'Traditional Pomodoro',
    description: '25 minutes work, 5 minutes break. Simple and effective.',
    recommended: (state: any) => state.currentSession.energyLevel === 3,
  },
  {
    name: 'Extended Focus',
    description: '45 minutes work, 15 minutes break. For deep work sessions.',
    recommended: (state: any) => state.currentSession.energyLevel >= 4 && state.currentSession.focusScore >= 80,
  },
  {
    name: 'Short Burst',
    description: '15 minutes work, 3 minutes break. When energy is low or tasks are challenging.',
    recommended: (state: any) => state.currentSession.energyLevel <= 2 || state.currentSession.distractions >= 3,
  },
  {
    name: '90-Minute Focus Block',
    description: '90 minutes work, 20 minutes break. Aligns with natural ultradian rhythm.',
    recommended: (state: any) => 
      state.currentSession.energyLevel >= 4 && 
      state.currentSession.focusScore >= 90 && 
      state.statistics.averageCompletionRate >= 80,
  },
];

export const FOCUS_ENHANCEMENT_TIPS = [
  'Create a dedicated workspace with minimal distractions',
  'Use noise-canceling headphones or white noise',
  'Keep a water bottle nearby to stay hydrated',
  'Write down distracting thoughts to address later',
  'Use the "Two-Minute Rule" - if it takes less than two minutes, do it now',
  'Practice the "One Task at a Time" principle',
  'Take regular screen breaks using the 20-20-20 rule',
  'Maintain good posture to improve focus and energy',
];

export const getRecommendedTechnique = (state: any) => {
  return POMODORO_TECHNIQUES.find(technique => technique.recommended(state)) || POMODORO_TECHNIQUES[0];
};
