import React, { useState, useEffect, useCallback } from 'react';
import { TitleBar, type AppTheme } from './components/TitleBar';
import { KokomeMascot, type MascotMood } from './components/KokomeMascot';
import { FocusTimer } from './components/FocusTimer';
import { SoundscapeMixer } from './components/SoundscapeMixer';
import { SystemHUD } from './components/SystemHUD';
import { QuestPad } from './components/QuestPad';
import { Clock, Waves, Activity, CheckSquare } from 'lucide-react';
import { audioEngine } from './utils/audioEngine';

type TabType = 'focus' | 'ambient' | 'system' | 'quests';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('kokome_theme') as AppTheme) || 'sakura';
  });
  const [isCompact, setIsCompact] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('focus');

  // Mascot synchronizers
  const [taskTitle, setTaskTitle] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerBreak, setIsTimerBreak] = useState(false);
  const [cpuPercent, setCpuPercent] = useState(14);
  const [affection, setAffection] = useState<number>(() => {
    return Number(localStorage.getItem('kokome_affection') || '15');
  });

  useEffect(() => {
    localStorage.setItem('kokome_theme', theme);
  }, [theme]);

  // Compute mascot mood
  let mood: MascotMood = 'idle';
  if (isTimerRunning) {
    mood = isTimerBreak ? 'break' : 'focus';
  } else if (isTimerBreak) {
    mood = 'break';
  }

  const handleTimerStateChange = useCallback((running: boolean, isBreak: boolean) => {
    setIsTimerRunning(running);
    setIsTimerBreak(isBreak);
  }, []);

  const handleAddAffection = useCallback((amount = 1) => {
    setAffection((prev) => {
      const next = prev + amount;
      localStorage.setItem('kokome_affection', next.toString());
      return next;
    });
  }, []);

  const handleToggleCompact = useCallback((nextCompact?: boolean) => {
    audioEngine.playClickSound();
    setIsCompact((prev) => {
      const target = typeof nextCompact === 'boolean' ? nextCompact : !prev;
      if (window.electronAPI && window.electronAPI.setWindowSize) {
        if (target) {
          window.electronAPI.setWindowSize(280, 420);
        } else {
          window.electronAPI.setWindowSize(440, 720);
        }
      }
      return target;
    });
  }, []);

  const handleTabSwitch = (tab: TabType) => {
    audioEngine.playClickSound();
    setActiveTab(tab);
  };

  return (
    <div className={`kokome-app-shell theme-${theme} ${isCompact ? 'compact-mode' : ''}`}>
      {/* Frameless Top Window Bar */}
      <TitleBar
        theme={theme}
        setTheme={setTheme}
        isCompact={isCompact}
        onToggleCompact={handleToggleCompact}
      />

      {/* Main Glass Panel */}
      <main className="kokome-main-panel">
        {/* Compact Mode View */}
        {isCompact ? (
          <div className="compact-content">
            <KokomeMascot
              mood={mood}
              cpuPercent={cpuPercent}
              taskTitle={taskTitle}
              isCompact={true}
              affection={affection}
              onAddAffection={handleAddAffection}
            />
            <div className="compact-status">
              <span className="compact-task-tag">
                {taskTitle ? taskTitle : isTimerRunning ? 'Focus Active' : 'Kokome Chilling'}
              </span>
              <button
                className="compact-expand-btn"
                onClick={() => handleToggleCompact(false)}
              >
                Expand Companion Deck
              </button>
            </div>
          </div>
        ) : (
          /* Full Companion Deck View */
          <div className="deck-content">
            {/* Top Mascot Hero Section */}
            <section className="mascot-hero-section">
              <KokomeMascot
                mood={mood}
                cpuPercent={cpuPercent}
                taskTitle={taskTitle}
                isCompact={false}
                affection={affection}
                onAddAffection={handleAddAffection}
              />
            </section>

            {/* Navigation Tabs */}
            <nav className="deck-nav-tabs">
              <button
                className={`deck-nav-btn ${activeTab === 'focus' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('focus')}
              >
                <Clock size={15} />
                <span>Focus</span>
              </button>

              <button
                className={`deck-nav-btn ${activeTab === 'ambient' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('ambient')}
              >
                <Waves size={15} />
                <span>Sounds</span>
              </button>

              <button
                className={`deck-nav-btn ${activeTab === 'system' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('system')}
              >
                <Activity size={15} />
                <span>System</span>
              </button>

              <button
                className={`deck-nav-btn ${activeTab === 'quests' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('quests')}
              >
                <CheckSquare size={15} />
                <span>Quests</span>
              </button>
            </nav>

            {/* Active Tab Screen (Persisted so Timer and Audio Sliders never reset) */}
            <div className="deck-tab-view">
              <div style={{ display: activeTab === 'focus' ? 'block' : 'none' }}>
                <FocusTimer
                  onStateChange={handleTimerStateChange}
                  taskTitle={taskTitle}
                  setTaskTitle={setTaskTitle}
                />
              </div>

              <div style={{ display: activeTab === 'ambient' ? 'block' : 'none' }}>
                <SoundscapeMixer />
              </div>

              <div style={{ display: activeTab === 'system' ? 'block' : 'none' }}>
                <SystemHUD onCpuUpdate={(cpu) => setCpuPercent(cpu)} />
              </div>

              <div style={{ display: activeTab === 'quests' ? 'block' : 'none' }}>
                <QuestPad onAddAffection={handleAddAffection} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
