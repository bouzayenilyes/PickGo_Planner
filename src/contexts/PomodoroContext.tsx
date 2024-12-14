import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { POMODORO_LEVELS } from '../components/pomodoro/PomodoroStats';
import { triggerConfetti } from '../utils/confetti';

export interface PomodoroState {
  totalPomodoros: number;
  dailyStreak: number;
  weeklyPomodoros: number;
  monthlyPomodoros: number;
  achievements: string[];
  level: {
    current: keyof typeof POMODORO_LEVELS;
    progress: number;
  };
  lastCompletedDate: string | null;
  settings: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    notifications: boolean;
    sound: boolean;
    smartBreaks: boolean;
    focusMode: boolean;
    dailyGoal: number;
    weeklyGoal: number;
    autoAdjustWorkDuration: boolean;
    energyLevelTracking: boolean;
    preferredWorkingHours: {
      start: number;
      end: number;
    };
    customSounds: {
      work: string;
      break: string;
      complete: string;
    };
  };
  currentSession: {
    mode: 'work' | 'shortBreak' | 'longBreak';
    timeLeft: number;
    isRunning: boolean;
    energyLevel: number;
    focusScore: number;
    distractions: number;
  };
  statistics: {
    bestFocusHours: number[];
    averageCompletionRate: number;
    mostProductiveDays: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[];
    weeklyProgress: number[];
    monthlyProgress: number[];
  };
}

export type PomodoroAction =
  | { type: 'COMPLETE_POMODORO' }
  | { type: 'UPDATE_STREAK' }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievement: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<PomodoroState['settings']> }
  | { type: 'RESET_STATS' }
  | { type: 'START_SESSION' }
  | { type: 'PAUSE_SESSION' }
  | { type: 'UPDATE_ENERGY_LEVEL'; level: number }
  | { type: 'LOG_DISTRACTION' }
  | { type: 'UPDATE_FOCUS_SCORE'; score: number }
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'ADJUST_WORK_DURATION'; duration: number }
  | { type: 'SET_TIME_LEFT'; timeLeft: number }
  | { type: 'SET_MODE'; mode: 'work' | 'shortBreak' | 'longBreak' }
  | { type: 'RESET_CYCLE' };

const initialState: PomodoroState = {
  totalPomodoros: 0,
  dailyStreak: 0,
  weeklyPomodoros: 0,
  monthlyPomodoros: 0,
  achievements: [],
  level: {
    current: 'NOVICE',
    progress: 0,
  },
  lastCompletedDate: null,
  settings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notifications: true,
    sound: true,
    smartBreaks: true,
    focusMode: false,
    dailyGoal: 8,
    weeklyGoal: 40,
    autoAdjustWorkDuration: true,
    energyLevelTracking: true,
    preferredWorkingHours: {
      start: 9,
      end: 17,
    },
    customSounds: {
      work: 'default',
      break: 'default',
      complete: 'default',
    },
  },
  currentSession: {
    mode: 'work',
    timeLeft: 25 * 60,
    isRunning: false,
    energyLevel: 5,
    focusScore: 100,
    distractions: 0,
  },
  statistics: {
    bestFocusHours: [],
    averageCompletionRate: 0,
    mostProductiveDays: [],
    weeklyProgress: Array(7).fill(0),
    monthlyProgress: Array(30).fill(0),
  },
};

const calculateLevel = (totalPomodoros: number) => {
  const levels = Object.entries(POMODORO_LEVELS).reverse();
  const currentLevel = levels.find(
    ([_, level]) => totalPomodoros >= level.threshold
  );

  if (!currentLevel) return { current: 'NOVICE' as keyof typeof POMODORO_LEVELS, progress: 0 };

  const nextLevel = levels[levels.indexOf(currentLevel) - 1];
  const currentThreshold = currentLevel[1].threshold;
  const nextThreshold = nextLevel ? nextLevel[1].threshold : currentThreshold;
  const progress = nextLevel
    ? ((totalPomodoros - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100;

  return {
    current: currentLevel[0] as keyof typeof POMODORO_LEVELS,
    progress: Math.min(Math.round(progress), 100),
  };
};

const checkAchievements = (state: PomodoroState): string[] => {
  const newAchievements = [...state.achievements];
  const currentHour = new Date().getHours();

  // Check for first pomodoro
  if (state.totalPomodoros === 1) {
    newAchievements.push('FIRST_POMODORO');
    triggerConfetti('achievement');
  }

  // Check for daily streak achievement
  if (state.dailyStreak >= 5 && !state.achievements.includes('DAILY_STREAK')) {
    newAchievements.push('DAILY_STREAK');
    triggerConfetti('achievement');
  }

  // Check for early bird achievement
  if (currentHour < 9 && !state.achievements.includes('EARLY_BIRD')) {
    newAchievements.push('EARLY_BIRD');
    triggerConfetti('achievement');
  }

  // Check for night owl achievement
  if (currentHour >= 22 && !state.achievements.includes('NIGHT_OWL')) {
    newAchievements.push('NIGHT_OWL');
    triggerConfetti('achievement');
  }

  // Check for weekend warrior achievement
  const isWeekend = [0, 6].includes(new Date().getDay());
  if (isWeekend && state.weeklyPomodoros >= 3 && !state.achievements.includes('WEEKEND_WARRIOR')) {
    newAchievements.push('WEEKEND_WARRIOR');
    triggerConfetti('achievement');
  }

  return newAchievements;
};

const pomodoroReducer = (state: PomodoroState, action: PomodoroAction): PomodoroState => {
  switch (action.type) {
    case 'COMPLETE_POMODORO': {
      // Trigger confetti for completed pomodoro
      triggerConfetti('pomodoro');

      const newState = {
        ...state,
        totalPomodoros: state.totalPomodoros + 1,
        weeklyPomodoros: state.weeklyPomodoros + 1,
        monthlyPomodoros: state.monthlyPomodoros + 1,
        lastCompletedDate: new Date().toISOString(),
      };

      // Update level
      newState.level = calculateLevel(newState.totalPomodoros);

      // Check for new achievements
      newState.achievements = checkAchievements(newState);

      return newState;
    }

    case 'UPDATE_STREAK': {
      const today = new Date().toISOString().split('T')[0];
      const lastCompleted = state.lastCompletedDate
        ? state.lastCompletedDate.split('T')[0]
        : null;

      if (!lastCompleted) return state;

      const isConsecutiveDay =
        new Date(today).getTime() - new Date(lastCompleted).getTime() <=
        24 * 60 * 60 * 1000;

      return {
        ...state,
        dailyStreak: isConsecutiveDay ? state.dailyStreak + 1 : 1,
      };
    }

    case 'UNLOCK_ACHIEVEMENT':
      if (state.achievements.includes(action.achievement)) return state;
      return {
        ...state,
        achievements: [...state.achievements, action.achievement],
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
        },
      };

    case 'RESET_STATS':
      return {
        ...initialState,
        settings: state.settings,
      };

    case 'START_SESSION': {
      // Check if it's within preferred working hours
      const currentHour = new Date().getHours();
      const isPreferredTime = currentHour >= state.settings.preferredWorkingHours.start && 
                             currentHour < state.settings.preferredWorkingHours.end;
      
      // Suggest optimal work duration based on energy level and time of day
      let suggestedDuration = state.settings.workDuration;
      if (state.settings.autoAdjustWorkDuration) {
        if (state.currentSession.energyLevel >= 4) {
          suggestedDuration = Math.min(45, suggestedDuration + 5);
        } else if (state.currentSession.energyLevel <= 2) {
          suggestedDuration = Math.max(15, suggestedDuration - 5);
        }
      }

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          isRunning: true,
          timeLeft: suggestedDuration * 60,
        },
      };
    }

    case 'UPDATE_ENERGY_LEVEL': {
      const newEnergyLevel = action.level;
      // Adjust break duration based on energy level
      let breakDuration = state.settings.shortBreakDuration;
      if (state.settings.smartBreaks) {
        if (newEnergyLevel <= 2) {
          breakDuration += 2; // Longer breaks when energy is low
        } else if (newEnergyLevel >= 4) {
          breakDuration = Math.max(3, breakDuration - 1); // Shorter breaks when energy is high
        }
      }

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          energyLevel: newEnergyLevel,
        },
        settings: {
          ...state.settings,
          shortBreakDuration: breakDuration,
        },
      };
    }

    case 'LOG_DISTRACTION': {
      const newDistractions = state.currentSession.distractions + 1;
      const newFocusScore = Math.max(0, state.currentSession.focusScore - 10);

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          distractions: newDistractions,
          focusScore: newFocusScore,
        },
      };
    }

    case 'TOGGLE_FOCUS_MODE': {
      if (!state.settings.focusMode) {
        // Enable focus mode features
        // This would integrate with browser APIs or system settings
        // to block distracting websites/apps
      }

      return {
        ...state,
        settings: {
          ...state.settings,
          focusMode: !state.settings.focusMode,
        },
      };
    }

    default:
      return state;
  }
};

const PomodoroContext = createContext<{
  state: PomodoroState;
  dispatch: React.Dispatch<PomodoroAction>;
} | null>(null);

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(pomodoroReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('pomodoroState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      Object.keys(initialState).forEach(key => {
        if (!(key in parsedState)) {
          parsedState[key] = initialState[key as keyof PomodoroState];
        }
      });
      dispatch({ type: 'UPDATE_SETTINGS', settings: parsedState.settings });
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    localStorage.setItem('pomodoroState', JSON.stringify(state));
  }, [state]);

  // Reset weekly and monthly stats when appropriate
  useEffect(() => {
    const checkResetStats = () => {
      const now = new Date();
      const lastReset = localStorage.getItem('lastStatsReset');
      const lastResetDate = lastReset ? new Date(lastReset) : null;

      if (!lastResetDate) {
        localStorage.setItem('lastStatsReset', now.toISOString());
        return;
      }

      // Reset weekly stats if it's a new week
      if (now.getDay() < lastResetDate.getDay()) {
        dispatch({ type: 'RESET_STATS' });
      }

      // Reset monthly stats if it's a new month
      if (now.getMonth() !== lastResetDate.getMonth()) {
        dispatch({ type: 'RESET_STATS' });
      }

      localStorage.setItem('lastStatsReset', now.toISOString());
    };

    checkResetStats();
    const interval = setInterval(checkResetStats, 1000 * 60 * 60); // Check every hour
    return () => clearInterval(interval);
  }, []);

  return (
    <PomodoroContext.Provider value={{ state, dispatch }}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoroContext = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoroContext must be used within a PomodoroProvider');
  }
  return context;
};
