import { PomodoroState } from '../contexts/PomodoroContext';

interface ProductivityTip {
  title: string;
  description: string;
  category: 'focus' | 'energy' | 'technique' | 'environment' | 'mindset';
}

interface Technique {
  name: string;
  description: string;
  recommendedEnergyLevel: number[];
  recommendedFocusScore: number[];
}

const productivityTips: ProductivityTip[] = [
  {
    title: 'Take Deep Breaths',
    description: 'Practice deep breathing exercises to increase oxygen flow and improve focus.',
    category: 'focus'
  },
  {
    title: 'Hydrate Regularly',
    description: 'Keep a water bottle nearby and stay hydrated for better cognitive performance.',
    category: 'energy'
  },
  {
    title: 'Two-Minute Rule',
    description: 'If a task takes less than two minutes, do it immediately rather than postponing.',
    category: 'technique'
  },
  {
    title: 'Declutter Workspace',
    description: 'A clean workspace helps maintain focus and reduces visual distractions.',
    category: 'environment'
  },
  {
    title: 'Growth Mindset',
    description: 'View challenges as opportunities for learning and growth.',
    category: 'mindset'
  }
];

const techniques: Technique[] = [
  {
    name: 'Standard Pomodoro',
    description: 'Focus for 25 minutes, then take a 5-minute break.',
    recommendedEnergyLevel: [3, 4, 5],
    recommendedFocusScore: [70, 100]
  },
  {
    name: 'Short Bursts',
    description: 'Work in 15-minute intervals with frequent mini-breaks.',
    recommendedEnergyLevel: [1, 2],
    recommendedFocusScore: [0, 50]
  },
  {
    name: 'Extended Focus',
    description: 'Longer 45-minute sessions for deep work when energy is high.',
    recommendedEnergyLevel: [4, 5],
    recommendedFocusScore: [80, 100]
  }
];

export const getRelevantTips = (state: PomodoroState): ProductivityTip[] => {
  const { energyLevel, focusScore } = state.currentSession;
  
  let relevantTips = [...productivityTips];
  
  if (energyLevel <= 3) {
    relevantTips = relevantTips.filter(tip => tip.category === 'energy');
  }
  
  if (focusScore <= 70) {
    relevantTips = relevantTips.filter(tip => tip.category === 'focus' || tip.category === 'environment');
  }
  
  return relevantTips;
};

export const getRecommendedTechnique = (state: PomodoroState): Technique => {
  const { energyLevel, focusScore } = state.currentSession;
  
  return techniques.find(technique => 
    technique.recommendedEnergyLevel.includes(energyLevel) &&
    focusScore >= technique.recommendedFocusScore[0] &&
    focusScore <= technique.recommendedFocusScore[1]
  ) || techniques[0]; // Default to standard Pomodoro if no match
};
