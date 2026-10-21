import React, { useState, useEffect } from 'react';
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

  const handleTimerStateChange = (running: boolean, isBreak: boolean) => {
    setIsTimerRunning(running);
    setIsTimerBreak(isBreak);
  };

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
        setIsCompact={setIsCompact}
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
            />
            <div className="compact-status">
              <span className="compact-task-tag">
                {taskTitle ? taskTitle : isTimerRunning ? 'Focus Active' : 'Kokome Chilling'}
              </span>
              <button
                className="compact-expand-btn"
                onClick={() => setIsCompact(false)}
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

            {/* Active Tab Screen */}
            <div className="deck-tab-view">
              {activeTab === 'focus' && (
                <FocusTimer
                  onStateChange={handleTimerStateChange}
                  taskTitle={taskTitle}
                  setTaskTitle={setTaskTitle}
                />
              )}

              {activeTab === 'ambient' && <SoundscapeMixer />}

              {activeTab === 'system' && (
                <SystemHUD onCpuUpdate={(cpu) => setCpuPercent(cpu)} />
              )}

              {activeTab === 'quests' && <QuestPad />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
