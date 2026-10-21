import React, { useState, useEffect } from 'react';
import { Minus, X, Pin, PinOff, Palette, Minimize2, Maximize2 } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export type AppTheme = 'sakura' | 'abyss' | 'solar' | 'matcha';

interface TitleBarProps {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
}

const THEME_LIST: { id: AppTheme; name: string; color: string }[] = [
  { id: 'sakura', name: 'Sakura Cyber', color: '#F43F5E' },
  { id: 'abyss', name: 'Neon Abyss', color: '#06B6D4' },
  { id: 'solar', name: 'Solar Flare', color: '#F59E0B' },
  { id: 'matcha', name: 'Matcha Zen', color: '#10B981' }
];

export const TitleBar: React.FC<TitleBarProps> = ({
  theme,
  setTheme,
  isCompact,
  setIsCompact
}) => {
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getAlwaysOnTop) {
      window.electronAPI.getAlwaysOnTop().then((pinned) => {
        setIsPinned(pinned);
      });
    }
  }, []);

  const handleMinimize = () => {
    audioEngine.playClickSound();
    if (window.electronAPI) {
      window.electronAPI.minimize();
    }
  };

  const handleClose = () => {
    audioEngine.playClickSound();
    if (window.electronAPI) {
      window.electronAPI.close();
    }
  };

  const togglePin = async () => {
    audioEngine.playClickSound();
    const nextPin = !isPinned;
    setIsPinned(nextPin);
    if (window.electronAPI && window.electronAPI.setAlwaysOnTop) {
      await window.electronAPI.setAlwaysOnTop(nextPin);
    }
  };

  const toggleCompact = () => {
    audioEngine.playClickSound();
    const nextCompact = !isCompact;
    setIsCompact(nextCompact);

    if (window.electronAPI && window.electronAPI.setWindowSize) {
      if (nextCompact) {
        window.electronAPI.setWindowSize(280, 420);
      } else {
        window.electronAPI.setWindowSize(440, 720);
      }
    }
  };

  const cycleTheme = () => {
    audioEngine.playClickSound();
    const curIdx = THEME_LIST.findIndex((t) => t.id === theme);
    const nextTheme = THEME_LIST[(curIdx + 1) % THEME_LIST.length].id;
    setTheme(nextTheme);
  };

  return (
    <header className="window-titlebar">
      {/* Draggable Title Region */}
      <div className="titlebar-drag-region">
        <div className="brand-badge">
          <img src="/icon.png" alt="Kokome Cat" className="brand-avatar-img" />
          <span className="brand-name">KOKOME</span>
          <span className="brand-version">v1.0</span>
        </div>
      </div>

      {/* Action Buttons (Non-draggable) */}
      <div className="titlebar-controls">
        {/* Theme Cycle Button */}
        <button
          className="titlebar-btn theme-btn"
          onClick={cycleTheme}
          title={`Theme: ${THEME_LIST.find((t) => t.id === theme)?.name}. Click to change.`}
        >
          <Palette size={13} />
          <span
            className="theme-indicator-dot"
            style={{ backgroundColor: THEME_LIST.find((t) => t.id === theme)?.color }}
          />
        </button>

        {/* Compact Mode Toggle */}
        <button
          className={`titlebar-btn ${isCompact ? 'active' : ''}`}
          onClick={toggleCompact}
          title={isCompact ? 'Expand to Full Deck' : 'Collapse to Mini Buddy'}
        >
          {isCompact ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
        </button>

        {/* Always on Top Pin */}
        <button
          className={`titlebar-btn ${isPinned ? 'pinned' : ''}`}
          onClick={togglePin}
          title={isPinned ? 'Unpin from Top' : 'Pin Always on Top'}
        >
          {isPinned ? <Pin size={13} className="pin-active-icon" /> : <PinOff size={13} />}
        </button>

        {/* Minimize */}
        <button
          className="titlebar-btn minimize-btn"
          onClick={handleMinimize}
          title="Minimize"
        >
          <Minus size={13} />
        </button>

        {/* Close */}
        <button
          className="titlebar-btn close-btn"
          onClick={handleClose}
          title="Close"
        >
          <X size={13} />
        </button>
      </div>
    </header>
  );
};
