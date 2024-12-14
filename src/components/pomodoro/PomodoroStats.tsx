import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Tooltip,
  Grid,
  styled,
  Badge,
} from '@mui/material';
import { ColorPalette } from '../../styles';
import { getFontColor } from '../../utils';

// Level thresholds and rewards
export const POMODORO_LEVELS = {
  NOVICE: { threshold: 0, title: 'Novice Timer', icon: '🌱' },
  FOCUSED: { threshold: 20, title: 'Focused Mind', icon: '🎯' },
  PRODUCTIVE: { threshold: 50, title: 'Productivity Master', icon: '⚡' },
  EXPERT: { threshold: 100, title: 'Time Expert', icon: '🎓' },
  MASTER: { threshold: 200, title: 'Pomodoro Master', icon: '👑' },
  GURU: { threshold: 500, title: 'Time Management Guru', icon: '🌟' },
};

// Achievements and their requirements
export const ACHIEVEMENTS = {
  FIRST_POMODORO: { title: 'First Timer', description: 'Complete your first Pomodoro', icon: '🎉' },
  DAILY_STREAK: { title: 'Consistency King', description: 'Complete 5 Pomodoros in a day', icon: '📅' },
  FOCUS_MASTER: { title: 'Focus Master', description: 'Complete a full cycle without breaks', icon: '🧘' },
  EARLY_BIRD: { title: 'Early Bird', description: 'Start a Pomodoro before 9 AM', icon: '🌅' },
  NIGHT_OWL: { title: 'Night Owl', description: 'Complete a Pomodoro after 10 PM', icon: '🌙' },
  WEEKEND_WARRIOR: { title: 'Weekend Warrior', description: 'Complete 3 Pomodoros on a weekend', icon: '💪' },
};

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: '1rem',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  color: '#FFFFFF',
  textAlign: 'center',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const AchievementBadge = styled(Box)(({ theme, unlocked }) => ({
  padding: '0.5rem 1rem',
  borderRadius: '12px',
  backgroundColor: unlocked ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  opacity: unlocked ? 1 : 0.5,
  '&:hover': {
    transform: unlocked ? 'translateY(-2px)' : 'none',
    backgroundColor: unlocked ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
  },
}));

const StatValue = styled(Typography)({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: '#FFFFFF',
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  lineHeight: 1.2,
});

const StatLabel = styled(Typography)({
  fontSize: '1rem',
  fontWeight: 500,
  color: '#FFFFFF',
  opacity: 0.9,
  marginTop: '0.5rem',
});

const LevelTitle = styled(Typography)({
  fontSize: '1.75rem',
  fontWeight: 700,
  color: '#FFFFFF',
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  marginBottom: '1rem',
});

const ProgressLabel = styled(Typography)({
  fontSize: '1.1rem',
  fontWeight: 500,
  color: '#FFFFFF',
  opacity: 0.9,
});

const AchievementTitle = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#FFFFFF',
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  marginBottom: '1rem',
});

const AchievementText = styled(Typography)({
  fontSize: '1rem',
  color: '#FFFFFF',
  opacity: 0.9,
});

interface PomodoroStatsProps {
  totalPomodoros: number;
  dailyStreak: number;
  weeklyPomodoros: number;
  monthlyPomodoros: number;
  achievements: string[];
  level: {
    current: keyof typeof POMODORO_LEVELS;
    progress: number;
  };
}

const PomodoroStats: React.FC<PomodoroStatsProps> = ({
  totalPomodoros,
  dailyStreak,
  weeklyPomodoros,
  monthlyPomodoros,
  achievements,
  level,
}) => {
  const currentLevel = POMODORO_LEVELS[level.current];
  const nextLevel = Object.entries(POMODORO_LEVELS).find(
    ([key]) => POMODORO_LEVELS[key as keyof typeof POMODORO_LEVELS].threshold > totalPomodoros
  );

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      {/* Level Progress */}
      <StatsCard sx={{ mb: 2 }}>
        <LevelTitle>
          {currentLevel.icon} Level: {currentLevel.title}
        </LevelTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ProgressLabel>
            Progress to {nextLevel ? nextLevel[1].title : 'Max Level'}
          </ProgressLabel>
          <LinearProgress
            variant="determinate"
            value={level.progress}
            sx={{
              flexGrow: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#FFFFFF',
              },
            }}
          />
          <ProgressLabel>{level.progress}%</ProgressLabel>
        </Box>
      </StatsCard>

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Tooltip title="Total Pomodoros Completed" arrow>
            <StatsCard>
              <StatValue>{totalPomodoros}</StatValue>
              <StatLabel>Total 🍅</StatLabel>
            </StatsCard>
          </Tooltip>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Tooltip title="Daily Streak" arrow>
            <StatsCard>
              <StatValue>{dailyStreak}</StatValue>
              <StatLabel>Streak 🔥</StatLabel>
            </StatsCard>
          </Tooltip>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Tooltip title="This Week's Pomodoros" arrow>
            <StatsCard>
              <StatValue>{weeklyPomodoros}</StatValue>
              <StatLabel>Weekly 📅</StatLabel>
            </StatsCard>
          </Tooltip>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Tooltip title="This Month's Pomodoros" arrow>
            <StatsCard>
              <StatValue>{monthlyPomodoros}</StatValue>
              <StatLabel>Monthly 📊</StatLabel>
            </StatsCard>
          </Tooltip>
        </Grid>
      </Grid>

      {/* Achievements */}
      <StatsCard>
        <AchievementTitle>🏆 Achievements</AchievementTitle>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(ACHIEVEMENTS).map(([key, achievement]) => (
            <Tooltip
              key={key}
              title={achievement.description}
              arrow
            >
              <AchievementBadge
                unlocked={achievements.includes(key)}
                sx={{
                  opacity: achievements.includes(key) ? 1 : 0.5,
                }}
              >
                <span>{achievement.icon}</span>
                <AchievementText>
                  {achievement.title}
                </AchievementText>
              </AchievementBadge>
            </Tooltip>
          ))}
        </Box>
      </StatsCard>
    </Box>
  );
};

export default PomodoroStats;
