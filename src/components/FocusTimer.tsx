import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../utils/audioEngine';

export type TimerMode = 'pomodoro' | 'sprint' | 'shortBreak' | 'longBreak';

interface FocusTimerProps {
  onStateChange: (isRunning: boolean, isBreak: boolean, taskName: string) => void;
  taskTitle: string;
  setTaskTitle: (title: string) => void;
}

const TIMER_PRESETS: Record<TimerMode, { label: string; minutes: number; isBreak: boolean }> = {
  pomodoro: { label: '25m Focus', minutes: 25, isBreak: false },
  sprint: { label: '50m Deep', minutes: 50, isBreak: false },
  shortBreak: { label: '5m Rest', minutes: 5, isBreak: true },
  longBreak: { label: '15m Break', minutes: 15, isBreak: true }
};

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onStateChange,
  taskTitle,
  setTaskTitle
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(() => {
    return Number(localStorage.getItem('kokome_completed_sessions') || '0');
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Synchronize state with parent mascot
  useEffect(() => {
    onStateChange(isRunning, TIMER_PRESETS[mode].isBreak, taskTitle);
  }, [isRunning, mode, taskTitle, onStateChange]);

  // Mode switcher
  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const secs = TIMER_PRESETS[newMode].minutes * 60;
    setMode(newMode);
    setTotalSeconds(secs);
    setTimeLeft(secs);
    audioEngine.playClickSound();
  };

  // Timer Tick Interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    audioEngine.playTimerFinishSound();

    const isBreak = TIMER_PRESETS[mode].isBreak;
    if (!isBreak) {
      const nextCount = completedSessions + 1;
      setCompletedSessions(nextCount);
      localStorage.setItem('kokome_completed_sessions', nextCount.toString());

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 }
      });

      // Suggest break
      switchMode('shortBreak');
    } else {
      switchMode('pomodoro');
    }
  };

  const toggleTimer = () => {
    if (!isRunning) {
      audioEngine.playFocusStartSound();
      setIsRunning(true);
    } else {
      audioEngine.playClickSound();
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    audioEngine.playClickSound();
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  };

  // Format mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Circular progress calculations
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) : 0;
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div className="focus-timer-card">
      {/* Preset Pills */}
      <div className="timer-mode-selector">
        <button
          className={`mode-pill ${mode === 'pomodoro' ? 'active' : ''}`}
          onClick={() => switchMode('pomodoro')}
        >
          <Zap size={13} />
          25m Focus
        </button>
        <button
          className={`mode-pill ${mode === 'sprint' ? 'active' : ''}`}
          onClick={() => switchMode('sprint')}
        >
          <Zap size={13} />
          50m Deep
        </button>
        <button
          className={`mode-pill ${mode === 'shortBreak' ? 'active' : ''}`}
          onClick={() => switchMode('shortBreak')}
        >
          <Coffee size={13} />
          5m Break
        </button>
        <button
          className={`mode-pill ${mode === 'longBreak' ? 'active' : ''}`}
          onClick={() => switchMode('longBreak')}
        >
          <Coffee size={13} />
          15m Break
        </button>
      </div>

      {/* Circular Progress & Clock Face */}
      <div className="timer-display-wrap">
        <svg className="timer-ring-svg" width="160" height="160" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-glow, #38BDF8)" />
              <stop offset="100%" stopColor="var(--accent-primary, #A855F7)" />
            </linearGradient>
          </defs>
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="8"
          />
          {/* Animated Progress Ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="url(#timerGrad)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 0.5s ease'
            }}
          />
        </svg>

        <div className="timer-digital-display">
          <span className="timer-clock">{timeFormatted}</span>
          <span className="timer-mode-name">
            {TIMER_PRESETS[mode].isBreak ? 'REST & RECHARGE' : 'DEEP FOCUS'}
          </span>
        </div>
      </div>

      {/* Current Goal / Task Input */}
      <div className="timer-task-input-wrap">
        <input
          type="text"
          placeholder="What are you working on right now?..."
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="timer-task-input"
          maxLength={60}
        />
      </div>

      {/* Control Buttons */}
      <div className="timer-controls">
        <button
          className={`timer-action-btn primary ${isRunning ? 'running' : ''}`}
          onClick={toggleTimer}
          title={isRunning ? 'Pause Timer' : 'Start Timer'}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>

        <button
          className="timer-action-btn secondary"
          onClick={resetTimer}
          title="Reset Timer"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Session Streak Counter */}
      <div className="timer-session-badge">
        <CheckCircle2 size={13} className="session-icon" />
        <span>Completed sprints today: <strong>{completedSessions}</strong></span>
      </div>
    </div>
  );
};
