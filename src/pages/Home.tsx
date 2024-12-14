import { useState, useEffect, ReactNode, useContext, useMemo } from "react";
import { TasksList } from "../components";
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import {
  AddButton,
  GreetingHeader,
  GreetingText,
  Offline,
  ProgressPercentageContainer,
  StyledProgress,
  TaskCompletionText,
  TaskCountHeader,
  TaskCountTextContainer,
  TasksCount,
  TasksCountContainer,
} from "../styles";

import { displayGreeting, getRandomGreeting, getTaskCompletionText } from "../utils";
import { Emoji } from "emoji-picker-react";
import { Box, Tooltip, Typography, IconButton } from "@mui/material";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { AddRounded, TodayRounded, WifiOff, Timer as TimerIcon } from "@mui/icons-material";
import { UserContext } from "../contexts/UserContext";
import { useResponsiveDisplay } from "../hooks/useResponsiveDisplay";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);
  const { tasks, emojisStyle, settings, name } = user;

  const [randomGreeting, setRandomGreeting] = useState<string | ReactNode>("");
  const [greetingKey, setGreetingKey] = useState<number>(0);
  const [completedTasksCount, setCompletedTasksCount] = useState<number>(0);

  const [tasksWithDeadlineTodayCount, setTasksWithDeadlineTodayCount] = useState<number>(0);
  const [tasksDueTodayNames, setTasksDueTodayNames] = useState<string[]>([]);

  const [pomodoroOpen, setPomodoroOpen] = useState(false);

  const completedTaskPercentage = useMemo<number>(
    () => (completedTasksCount / tasks.length) * 100,
    [completedTasksCount, tasks.length]
  );

  const isOnline = useOnlineStatus();
  const n = useNavigate();
  const isMobile = useResponsiveDisplay();

  useEffect(() => {
    setRandomGreeting(getRandomGreeting());
    document.title = "Todo App";

    const interval = setInterval(() => {
      setRandomGreeting(getRandomGreeting());
      setGreetingKey((prevKey) => prevKey + 1); // Update the key on each interval
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const completedCount = tasks.filter((task) => task.done).length;
    setCompletedTasksCount(completedCount);

    const today = new Date().setHours(0, 0, 0, 0);

    const dueTodayTasks = tasks.filter((task) => {
      if (task.deadline) {
        const taskDeadline = new Date(task.deadline).setHours(0, 0, 0, 0);
        return taskDeadline === today && !task.done;
      }
      return false;
    });

    setTasksWithDeadlineTodayCount(dueTodayTasks.length);

    // Use Intl to format and display task names due today
    const taskNamesDueToday = dueTodayTasks.map((task) => task.name);
    setTasksDueTodayNames(taskNamesDueToday);
  }, [tasks]);

  const replaceEmojiCodes = (text: string): ReactNode[] => {
    const emojiRegex = /\*\*(.*?)\*\*/g;
    const parts = text.split(emojiRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // It's an emoji code, render Emoji component
        const emojiCode = part.trim();
        return <Emoji key={index} size={20} unified={emojiCode} emojiStyle={emojisStyle} />;
      } else {
        // It's regular text
        return part;
      }
    });
  };

  const renderGreetingWithEmojis = (text: string | ReactNode) => {
    if (typeof text === "string") {
      return replaceEmojiCodes(text);
    } else {
      // It's already a ReactNode, no need to process
      return text;
    }
  };

  return (
    <>
      <GreetingHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Emoji unified="1f44b" emojiStyle={emojisStyle} /> &nbsp; {displayGreeting()}
          {name && (
            <span translate="no">
              , <span>{name}</span>
            </span>
          )}
          <Tooltip title="Focus Timer" placement="bottom">
            <IconButton
              onClick={() => setPomodoroOpen(true)}
              sx={{
                color: 'white',
                backgroundColor: 'primary.main',
                width: '40px',
                height: '40px',
                ml: 2,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease-in-out',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(124, 58, 237, 0.4)',
                  },
                  '70%': {
                    boxShadow: '0 0 0 10px rgba(124, 58, 237, 0)',
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(124, 58, 237, 0)',
                  },
                },
              }}
            >
              <TimerIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </GreetingHeader>
      <GreetingText key={greetingKey}>{renderGreetingWithEmojis(randomGreeting)}</GreetingText>
      {!isOnline && (
        <Offline>
          <WifiOff /> You're offline but you can use the app!
        </Offline>
      )}
      {tasks.length > 0 && (
        <TasksCountContainer>
          <TasksCount glow={settings[0].enableGlow}>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <StyledProgress
                variant="determinate"
                value={completedTaskPercentage}
                size={64}
                thickness={5}
                aria-label="Progress"
                glow={settings[0].enableGlow}
              />

              <ProgressPercentageContainer
                glow={settings[0].enableGlow && completedTaskPercentage > 0}
              >
                <Typography
                  variant="caption"
                  component="div"
                  color="white"
                  sx={{ fontSize: "16px", fontWeight: 600 }}
                >{`${Math.round(completedTaskPercentage)}%`}</Typography>
              </ProgressPercentageContainer>
            </Box>
            <TaskCountTextContainer>
              <TaskCountHeader>
                {completedTasksCount === 0
                  ? `You have ${tasks.length} task${tasks.length > 1 ? "s" : ""} to complete.`
                  : `You've completed ${completedTasksCount} out of ${tasks.length} tasks.`}
              </TaskCountHeader>
              <TaskCompletionText>
                {getTaskCompletionText(completedTaskPercentage)}
              </TaskCompletionText>
              {tasksWithDeadlineTodayCount > 0 && (
                <span
                  style={{
                    opacity: 0.8,
                    display: "inline-block",
                  }}
                >
                  <TodayRounded sx={{ fontSize: "20px", verticalAlign: "middle" }} />
                  &nbsp;Tasks due today:&nbsp;
                  <span translate="no">
                    {new Intl.ListFormat("en", { style: "long" }).format(tasksDueTodayNames)}
                  </span>
                </span>
              )}
            </TaskCountTextContainer>
          </TasksCount>
        </TasksCountContainer>
      )}

      <TasksList />

      {!isMobile && (
        <Tooltip title={tasks.length > 0 ? "Add New Task" : "Add Task"} placement="left">
          <AddButton
            animate={tasks.length === 0}
            glow={settings[0].enableGlow}
            onClick={() => n("add")}
            aria-label="Add Task"
          >
            <AddRounded style={{ fontSize: "44px" }} />
          </AddButton>
        </Tooltip>
      )}
      {pomodoroOpen && (
        <PomodoroTimer 
          dailyProgress={settings[0].totalPomodoros} 
          dailyGoal={settings[0].dailyGoal} 
          open={pomodoroOpen} 
          onClose={() => setPomodoroOpen(false)} 
        />
      )}
    </>
  );
};

export default Home;
