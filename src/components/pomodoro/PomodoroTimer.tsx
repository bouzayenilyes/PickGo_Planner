import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Dialog,
  useTheme,
  styled,
  Button,
  LinearProgress,
  Paper,
  Tooltip,
  Stack,
  Badge,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  SkipNext as SkipIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Timer as TimerIcon,
  VolumeUp as SoundIcon,
  VolumeOff as MuteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { getFontColor } from '../../utils';
import { ColorPalette } from '../../styles';
import { usePomodoroContext } from '../../contexts/PomodoroContext';
import PomodoroStats from './PomodoroStats';

const POMODORO_STATES = {
  WORK: { label: 'Focus', duration: 25, color: '#b624ff', description: 'Stay focused', icon: '🎯' },
  SHORT_BREAK: { label: 'Break', duration: 5, color: '#2a93d5', description: 'Take a break', icon: '☕' },
  LONG_BREAK: { label: 'Rest', duration: 15, color: '#00e952', description: 'Rest well', icon: '🌟' },
} as const;

type PomodoroState = keyof typeof POMODORO_STATES;

interface PomodoroTimerProps {
  open: boolean;
  onClose: () => void;
  dailyProgress: number;
  dailyGoal: number;
}

// Styled Components
const TimerDisplay = styled(Typography)<{ color?: string }>(({ theme, color }) => ({
  fontSize: 'clamp(3rem, 10vw, 6rem)',
  fontWeight: 700,
  fontFamily: 'monospace',
  background: `linear-gradient(135deg, ${color || theme.palette.primary.main}, ${
    getFontColor(theme.palette.secondary.main) === ColorPalette.fontLight ? '#ffffff' : '#000000'
  })`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: '1rem',
  textAlign: 'center',
}));

const StateButton = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
  borderRadius: '12px',
  padding: '8px 16px',
  minWidth: '100px',
  backgroundColor: selected 
    ? getFontColor(theme.palette.secondary.main) === ColorPalette.fontLight 
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.1)'
    : 'transparent',
  color: getFontColor(theme.palette.secondary.main),
  '&:hover': {
    backgroundColor: getFontColor(theme.palette.secondary.main) === ColorPalette.fontLight 
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.15)',
  },
}));

const ControlButton = styled(IconButton)(({ theme }) => ({
  color: getFontColor(theme.palette.secondary.main),
  backgroundColor: getFontColor(theme.palette.secondary.main) === ColorPalette.fontLight 
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)',
  padding: '12px',
  '&:hover': {
    backgroundColor: getFontColor(theme.palette.secondary.main) === ColorPalette.fontLight 
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.1)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.5rem',
  },
}));

const CycleIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  padding: '8px 16px',
  borderRadius: '12px',
  backgroundColor: getFontColor(theme.palette.secondary.main) === ColorPalette.fontLight 
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)',
}));

const CycleDot = styled(Box)<{ active?: boolean; completed?: boolean }>(({ theme, active, completed }) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: completed 
    ? theme.palette.primary.main 
    : active 
      ? 'rgba(255, 255, 255, 0.8)' 
      : 'rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem',
  borderRadius: '16px',
  backgroundColor: getFontColor(theme.palette.secondary.main) === ColorPalette.fontLight 
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)',
  marginTop: '1rem',
}));

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  open,
  onClose,
  dailyProgress,
  dailyGoal,
}) => {
  const theme = useTheme();
  const { state: pomodoroState, dispatch } = usePomodoroContext();
  const [currentState, setCurrentState] = useState<PomodoroState>('WORK');
  const [timeLeft, setTimeLeft] = useState(POMODORO_STATES[currentState].duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const {
    notifications: notificationsEnabled,
    sound: soundEnabled,
    autoStartBreaks,
    autoStartPomodoros,
  } = pomodoroState.settings;

  // Progress bar styled component with current state
  const ProgressBar = styled(LinearProgress)(({ theme }) => ({
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    backgroundColor: getFontColor(theme.palette.secondary.main) === ColorPalette.fontLight 
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)',
    '& .MuiLinearProgress-bar': {
      backgroundColor: POMODORO_STATES[currentState].color,
    },
  }));

  // Sound effects
  const tickSound = new Audio('/sounds/tick.mp3');
  const completeSound = new Audio('/sounds/complete.mp3');

  const playSound = (sound: HTMLAudioElement) => {
    if (soundEnabled) {
      sound.play().catch(console.error);
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleStateComplete();
            return 0;
          }
          if (prev % 60 === 0) playSound(tickSound);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRunning, timeLeft]);

  const handleStateComplete = () => {
    playSound(completeSound);

    if (currentState === 'WORK') {
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      
      // Update Pomodoro context
      dispatch({ type: 'COMPLETE_POMODORO' });
      dispatch({ type: 'UPDATE_STREAK' });

      // Show notification
      if (notificationsEnabled && Notification.permission === 'granted') {
        new Notification('Pomodoro Complete!', {
          body: 'Time for a break! Great work! 🎉',
          icon: '/favicon.ico'
        });
      }

      // Update cycle count and determine next break type
      const newCycleCount = (cycleCount + 1) % 4;
      setCycleCount(newCycleCount);
      
      const nextState = newCycleCount === 0 ? 'LONG_BREAK' : 'SHORT_BREAK';
      setCurrentState(nextState);
      setTimeLeft(POMODORO_STATES[nextState].duration * 60);
      if (autoStartBreaks) setIsRunning(true);
      else setIsRunning(false);
    } else {
      setCurrentState('WORK');
      setTimeLeft(POMODORO_STATES.WORK.duration * 60);
      if (autoStartPomodoros) setIsRunning(true);
      else setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(POMODORO_STATES[currentState].duration * 60);
  };

  const handleSkip = () => {
    handleStateComplete();
  };

  const handleResetCycle = () => {
    setCycleCount(0);
    setCompletedPomodoros(0);
    setCurrentState('WORK');
    setTimeLeft(POMODORO_STATES.WORK.duration * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (POMODORO_STATES[currentState].duration * 60)) * 100;
  const dailyProgressPercentage = (dailyProgress / dailyGoal) * 100;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }
      }}
    >
      <Box sx={{ 
        p: { xs: 2, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: theme => getFontColor(theme.secondary) === ColorPalette.fontLight 
          ? '#090b2258'
          : '#ffffff3e',
        backdropFilter: 'blur(10px)',
        minHeight: '80vh',
        color: theme => getFontColor(theme.secondary),
      }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: '600px',
            p: 4,
            borderRadius: '24px',
            bgcolor: theme => getFontColor(theme.secondary) === ColorPalette.fontLight 
              ? '#090b2287'
              : '#ffffff5c',
            border: '1px solid',
            borderColor: theme => 
              getFontColor(theme.secondary) === ColorPalette.fontLight 
                ? '#44479cb7' 
                : theme.primary,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack spacing={4}>
            {/* Timer States */}
            <Stack direction="row" spacing={2} justifyContent="center">
              {Object.entries(POMODORO_STATES).map(([state, { label, icon }]) => (
                <StateButton
                  key={state}
                  selected={currentState === state}
                  onClick={() => {
                    setCurrentState(state as PomodoroState);
                    setTimeLeft(POMODORO_STATES[state as PomodoroState].duration * 60);
                    setIsRunning(false);
                  }}
                >
                  {icon} {label}
                </StateButton>
              ))}
            </Stack>

            {/* Cycle Indicator */}
            <CycleIndicator>
              {[0, 1, 2, 3].map((index) => (
                <CycleDot 
                  key={index}
                  active={cycleCount === index}
                  completed={index < cycleCount}
                />
              ))}
              <Tooltip title="Reset Cycle" arrow>
                <ControlButton 
                  onClick={handleResetCycle}
                  sx={{ ml: 'auto', padding: '4px' }}
                >
                  <RefreshIcon sx={{ fontSize: '1.2rem' }} />
                </ControlButton>
              </Tooltip>
            </CycleIndicator>

            {/* Timer Display */}
            <Box textAlign="center">
              <TimerDisplay variant="h1" color={POMODORO_STATES[currentState].color}>
                {formatTime(timeLeft)}
              </TimerDisplay>
              <ProgressBar variant="determinate" value={progress} />
            </Box>

            {/* Controls */}
            <Stack direction="row" spacing={2} justifyContent="center">
              <ControlButton onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? <PauseIcon /> : <PlayIcon />}
              </ControlButton>
              <ControlButton onClick={handleReset}>
                <StopIcon />
              </ControlButton>
              <ControlButton onClick={handleSkip}>
                <SkipIcon />
              </ControlButton>
            </Stack>

            {/* Settings and Stats */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Sound" arrow>
                    <ControlButton 
                      onClick={() => dispatch({ 
                        type: 'UPDATE_SETTINGS', 
                        settings: { sound: !soundEnabled }
                      })}
                    >
                      {soundEnabled ? <SoundIcon /> : <MuteIcon />}
                    </ControlButton>
                  </Tooltip>
                  <Tooltip title="Notifications" arrow>
                    <ControlButton 
                      onClick={() => dispatch({ 
                        type: 'UPDATE_SETTINGS', 
                        settings: { notifications: !notificationsEnabled }
                      })}
                    >
                      {notificationsEnabled ? <NotificationsIcon /> : <NotificationsOffIcon />}
                    </ControlButton>
                  </Tooltip>
                </Stack>
                <Badge 
                  badgeContent={completedPomodoros} 
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: POMODORO_STATES[currentState].color,
                    }
                  }}
                >
                  <StatsContainer>
                    <Typography variant="body1">
                      Today's Progress: {dailyProgress}/{dailyGoal}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={dailyProgressPercentage}
                      sx={{ 
                        width: 100,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme => theme.palette.primary.main,
                        }
                      }} 
                    />
                  </StatsContainer>
                </Badge>
              </Stack>
            </Box>

            {/* Pomodoro Stats */}
            <PomodoroStats
              totalPomodoros={pomodoroState.totalPomodoros}
              dailyStreak={pomodoroState.dailyStreak}
              weeklyPomodoros={pomodoroState.weeklyPomodoros}
              monthlyPomodoros={pomodoroState.monthlyPomodoros}
              achievements={pomodoroState.achievements}
              level={pomodoroState.level}
            />
          </Stack>
        </Paper>
      </Box>
    </Dialog>
  );
};

export default PomodoroTimer;
