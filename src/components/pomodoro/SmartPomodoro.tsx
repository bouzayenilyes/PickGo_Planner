import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Slider,
  TextField,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  SkipNext,
  Psychology,
  TrendingUp,
  AccessTime,
  Settings,
  Battery20,
  Battery50,
  Battery80,
  BatteryFull,
  Notifications,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { usePomodoroContext } from '../../contexts/PomodoroContext';
import { getRelevantTips, getRecommendedTechnique } from '../../utils/productivityTips';
import { triggerConfetti } from '../../utils/confetti';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const TimerDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const SmartPomodoro: React.FC = () => {
  const { state, dispatch } = usePomodoroContext();
  const [showSettings, setShowSettings] = useState(false);
  const [currentTip, setCurrentTip] = useState<any>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (state.currentSession.isRunning) {
      timer = setInterval(() => {
        if (state.currentSession.timeLeft > 0) {
          dispatch({ type: 'SET_TIME_LEFT', timeLeft: state.currentSession.timeLeft - 1 });
        } else {
          handleSessionComplete();
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [state.currentSession.isRunning, state.currentSession.timeLeft]);

  useEffect(() => {
    // Update tips every 5 minutes
    const tipTimer = setInterval(() => {
      const tips = getRelevantTips(state);
      if (tips.length > 0) {
        setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(tipTimer);
  }, [state]);

  const handleSessionComplete = () => {
    const isWorkSession = state.currentSession.mode === 'work';
    
    if (isWorkSession) {
      dispatch({ type: 'COMPLETE_POMODORO' });
      triggerConfetti('pomodoro');
      
      if (state.settings.notifications) {
        new Notification('Pomodoro Complete!', {
          body: 'Great job! Time for a break.',
          icon: '/favicon.ico'
        });
      }
    }

    if (state.settings.autoStartBreaks && isWorkSession) {
      startNextSession('shortBreak');
    } else if (state.settings.autoStartPomodoros && !isWorkSession) {
      startNextSession('work');
    }
  };

  const startNextSession = (mode: 'work' | 'shortBreak' | 'longBreak') => {
    dispatch({ type: 'SET_MODE', mode });
    dispatch({ type: 'START_SESSION' });
  };

  const toggleTimer = () => {
    if (!state.currentSession.isRunning) {
      dispatch({ type: 'START_SESSION' });
    } else {
      dispatch({ type: 'PAUSE_SESSION' });
    }
  };

  const getEnergyIcon = () => {
    const level = state.currentSession.energyLevel;
    if (level <= 2) return <Battery20 />;
    if (level === 3) return <Battery50 />;
    if (level === 4) return <Battery80 />;
    return <BatteryFull />;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const recommendedTechnique = getRecommendedTechnique(state);

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Smart Pomodoro
        <IconButton onClick={() => setShowSettings(!showSettings)} sx={{ ml: 2 }}>
          <Settings />
        </IconButton>
      </Typography>

      <StyledCard>
        <TimerDisplay>
          <Box position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={(state.currentSession.timeLeft / (state.settings.workDuration * 60)) * 100}
              size={200}
              thickness={2}
              sx={{ color: 'primary.main' }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h3" component="div">
                {formatTime(state.currentSession.timeLeft)}
              </Typography>
            </Box>
          </Box>
        </TimerDisplay>

        <ControlsContainer>
          <Tooltip title={state.currentSession.isRunning ? 'Pause' : 'Start'}>
            <IconButton
              size="large"
              onClick={toggleTimer}
              color="primary"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              {state.currentSession.isRunning ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Stop">
            <IconButton
              size="large"
              onClick={() => dispatch({ type: 'RESET_CYCLE' })}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <Stop />
            </IconButton>
          </Tooltip>
          <Tooltip title="Skip to Next">
            <IconButton
              size="large"
              onClick={() => handleSessionComplete()}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <SkipNext />
            </IconButton>
          </Tooltip>
        </ControlsContainer>

        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip
            icon={<AccessTime />}
            label={`Mode: ${state.currentSession.mode}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={getEnergyIcon()}
            label={`Energy: ${state.currentSession.energyLevel}/5`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<TrendingUp />}
            label={`Focus: ${state.currentSession.focusScore}%`}
            color="primary"
            variant="outlined"
          />
        </Stack>

        {showSettings && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Quick Settings
            </Typography>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.settings.autoStartBreaks}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_SETTINGS',
                      settings: { autoStartBreaks: e.target.checked }
                    })}
                  />
                }
                label="Auto-start breaks"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={state.settings.autoStartPomodoros}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_SETTINGS',
                      settings: { autoStartPomodoros: e.target.checked }
                    })}
                  />
                }
                label="Auto-start pomodoros"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={state.settings.notifications}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_SETTINGS',
                      settings: { notifications: e.target.checked }
                    })}
                  />
                }
                label="Notifications"
                icon={<Notifications />}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Work Duration (minutes)</Typography>
              <Slider
                value={state.settings.workDuration}
                min={15}
                max={60}
                step={5}
                marks
                onChange={(_, value) => dispatch({
                  type: 'UPDATE_SETTINGS',
                  settings: { workDuration: value as number }
                })}
              />
            </Box>
          </>
        )}

        {currentTip && (
          <Alert
            severity="info"
            icon={<Psychology />}
            sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <Typography variant="subtitle1">{currentTip.title}</Typography>
            <Typography variant="body2">{currentTip.description}</Typography>
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Recommended Technique:
          </Typography>
          <Alert
            severity="success"
            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <Typography variant="subtitle2">{recommendedTechnique.name}</Typography>
            <Typography variant="body2">{recommendedTechnique.description}</Typography>
          </Alert>
        </Box>
      </StyledCard>
    </Box>
  );
};

export default SmartPomodoro;
