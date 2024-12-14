import React, { useEffect, useContext, useRef } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { showToast } from '../../utils';
import { Task } from '../../types/user';
import {
  AccessTimeOutlined,
  Flag,
  ErrorOutline,
  AlarmOutlined,
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

// Sound for task notification
const deadlineSound = new Audio('/sounds/task-deadline.mp3');

// Notification themes
const themes = {
  warning: {
    gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    shadowColor: 'rgba(255, 152, 0, 0.4)',
  },
  urgent: {
    gradient: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
    shadowColor: 'rgba(244, 67, 54, 0.4)',
  },
  deadline: {
    gradient: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
    shadowColor: 'rgba(233, 30, 99, 0.4)',
  }
};

// Time thresholds for notifications
const THRESHOLDS = {
  WARNING: 15 * 60 * 1000, // 15 minutes
  URGENT: 5 * 60 * 1000,   // 5 minutes
};

// Check interval (30 seconds)
const CHECK_INTERVAL = 30000;

// Animation keyframes
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

export const TaskAlert: React.FC = () => {
  const { user } = useContext(UserContext);
  const notifiedTasks = useRef<Set<string>>(new Set());

  const playSound = async () => {
    try {
      await deadlineSound.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const formatTimeLeft = (timeLeft: number): string => {
    const minutes = Math.floor(timeLeft / (1000 * 60));
    if (minutes < 1) {
      return 'less than a minute';
    }
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  };

  const getNotificationStyle = (timeLeft: number) => {
    const theme = timeLeft <= THRESHOLDS.URGENT ? themes.urgent : themes.warning;
    return {
      background: theme.gradient,
      color: '#fff',
      padding: '16px 20px',
      borderRadius: '16px',
      boxShadow: `0 8px 16px ${theme.shadowColor}`,
      border: 'none',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      animation: `${slideIn} 0.3s ease-out, ${pulse} 2s ease-in-out infinite`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      minWidth: '300px',
      maxWidth: '400px',
    };
  };

  const showDeadlineNotification = (task: Task, timeLeft: number) => {
    const formattedTime = formatTimeLeft(timeLeft);
    const isUrgent = timeLeft <= THRESHOLDS.URGENT;
    const style = getNotificationStyle(timeLeft);

    // Play notification sound
    playSound();

    // Show toast notification
    showToast(
      <div style={style}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '10px',
        }}>
          {isUrgent ? 
            <ErrorOutline sx={{ fontSize: 28 }} /> : 
            <AlarmOutlined sx={{ fontSize: 28 }} />
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '4px',
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
              {isUrgent ? 'Urgent: Task Ending Soon!' : 'Task Deadline Approaching'}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.9em',
              opacity: 0.9,
            }}>
              <Flag sx={{ fontSize: 16 }} />
              {task.priority}
            </div>
          </div>
          <div style={{ opacity: 0.9 }}>
            "{task.name}" ends in {formattedTime}
          </div>
          {isUrgent && (
            <div style={{
              fontSize: '0.9em',
              marginTop: '4px',
              opacity: 0.8,
              fontStyle: 'italic'
            }}>
              Complete this task soon to stay on track!
            </div>
          )}
        </div>
      </div>,
      {
        duration: isUrgent ? 12000 : 8000,
        position: 'bottom-right',
      }
    );

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(isUrgent ? 'Urgent: Task Ending Soon!' : 'Task Deadline Approaching', {
        body: `"${task.name}" ends in ${formattedTime}${isUrgent ? '\nComplete this task soon to stay on track!' : ''}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `task-${task.id}-${timeLeft}`,
        renotify: true,
        vibrate: isUrgent ? [200, 100, 200, 100, 200] : [200, 100, 200],
      });
    }
  };

  const showDeadlineReachedNotification = (task: Task) => {
    const style = {
      background: themes.deadline.gradient,
      color: '#fff',
      padding: '16px 20px',
      borderRadius: '16px',
      boxShadow: `0 8px 16px ${themes.deadline.shadowColor}`,
      border: 'none',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      animation: `${slideIn} 0.3s ease-out, ${pulse} 2s ease-in-out infinite`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      minWidth: '300px',
      maxWidth: '400px',
    };

    // Play notification sound
    playSound();

    // Show toast notification
    showToast(
      <div style={style}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '10px',
        }}>
          <AccessTimeOutlined sx={{ fontSize: 28 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '4px',
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
              Task Deadline Reached
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.9em',
              opacity: 0.9,
            }}>
              <Flag sx={{ fontSize: 16 }} />
              {task.priority}
            </div>
          </div>
          <div style={{ opacity: 0.9 }}>
            "{task.name}" has reached its deadline
          </div>
          <div style={{
            fontSize: '0.9em',
            marginTop: '4px',
            opacity: 0.8,
            fontStyle: 'italic'
          }}>
            Please update the task status
          </div>
        </div>
      </div>,
      {
        duration: 15000,
        position: 'bottom-right',
      }
    );

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Task Deadline Reached', {
        body: `"${task.name}" has reached its deadline\nPlease update the task status`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `task-${task.id}-deadline`,
        renotify: true,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
      });
    }
  };

  const checkDeadlines = () => {
    const now = new Date();

    user.tasks.forEach((task: Task) => {
      if (!task.done && task.deadline) {
        const deadline = new Date(task.deadline);
        const timeLeft = deadline.getTime() - now.getTime();

        // Check for tasks approaching deadline
        if (timeLeft > 0) {
          // For urgent notifications (5 minutes)
          if (timeLeft <= THRESHOLDS.URGENT) {
            const urgentId = `${task.id}-urgent`;
            if (!notifiedTasks.current.has(urgentId)) {
              showDeadlineNotification(task, timeLeft);
              notifiedTasks.current.add(urgentId);
            }
          }
          // For warning notifications (15 minutes)
          else if (timeLeft <= THRESHOLDS.WARNING) {
            const warningId = `${task.id}-warning`;
            if (!notifiedTasks.current.has(warningId)) {
              showDeadlineNotification(task, timeLeft);
              notifiedTasks.current.add(warningId);
            }
          }
        } 
        // Check for tasks that just reached their deadline
        else if (timeLeft >= -60000 && timeLeft <= 0) { // Within the last minute of deadline
          const deadlineId = `${task.id}-deadline-reached`;
          if (!notifiedTasks.current.has(deadlineId)) {
            showDeadlineReachedNotification(task);
            notifiedTasks.current.add(deadlineId);
          }
        }
      }
    });
  };

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initial check
    checkDeadlines();

    // Set up periodic checks
    const interval = setInterval(checkDeadlines, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [user.tasks]);

  return null;
};
