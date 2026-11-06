# 🐱 Kokome | Desktop Companion & Focus Sanctuary

<div align="center">
  <img src="./public/icon.png" width="130" height="130" alt="Kokome Professor Cat Mascot" style="border-radius: 50%; box-shadow: 0 0 25px rgba(255, 77, 141, 0.4);" />
  
  <h3>An intelligent, floating desktop companion with real-time system telemetry, procedural soundscapes, and gamified productivity sprints.</h3>

  <p>
    <img src="https://img.shields.io/badge/Electron-45.0.0-47848F?style=for-the-badge&logo=electron&logoColor=white" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
    <img src="https://img.shields.io/badge/TypeScript-6.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" />
  </p>
</div>

---

## ✨ Features

- **🐾 Dual Interactive Mascots**:
  - **Professor Cat (Official Icon)**: Hilarious reading-glasses cat inspecting code and notes. Reacts to clicks, wiggles his glasses/papers, purrs, and gives witty developer feedback.
  - **Cyber Spirit Mode**: Animated floating cyber-pet SVG with breathing, rhythmic blinking, blushing cheeks, and cyber headphones.
- **💖 Headpat & Unified Affection XP**: Click the mascot for headpats, bubble pop sound effects, heart particle bursts, and affection level-up celebrations. XP syncs seamlessly across daily quest completions.
- **⏱️ Focus Station & Pomodoro Sprinter**:
  - 25m Focus, 50m Deep Sprint, 5m Rest, and 15m Long Break presets.
  - Glowing circular progress ring, daily session streak counter, and confetti celebrations.
  - **Live Taskbar Countdown**: View remaining focus/break time directly from your OS taskbar, Alt+Tab window title, and tray tooltip.
- **🔔 Native OS Desktop Notifications**: Toast alerts notify you instantly when your focus sprints or rest breaks conclude, even when working in your editor or browser.
- **🎧 Procedural Ambient Sound Studio**:
  - 100% synthesized in real-time via the **Web Audio API** with smooth 50ms loop crossfading (zero audio file downloads, zero clicking).
  - Individual channels: **Gentle Rain**, **Cozy Fireplace**, **Lo-Fi Cafe Vinyl**, and **432Hz Zen Drone**.
  - One-click presets (*Rainy Cafe*, *Cozy Cabin*, *Zen Focus*) with automatic volume preference saving.
- **📊 System Vitality Deck (Hardware HUD)**:
  - Live OS CPU load percentage, core count, CPU model, memory usage (used vs total), and system uptime counter.
- **🎯 Daily Companion Quests & Scratchpad**:
  - Daily micro-habits & quest tracker with calendar-aware reset and RPG fanfare chimes.
  - Instant auto-saving Markdown scratchpad for quick paste & ideas.
- **🪟 Frameless Desktop Controls & Pin**:
  - Draggable frameless glass window with **Always-on-Top Pin** to float above your IDE / editor.
  - **Compact Mode**: Collapse into an unobtrusive mini floating buddy anytime.
  - **Window Memory**: Remembers your exact desktop position `(x, y)`, size, and pin preferences across restarts.
  - 4 Curated Palettes: **Sakura Cyber**, **Neon Abyss**, **Solar Flare**, and **Matcha Zen**.
- **📌 System Tray & Global Hotkey**:
  - Background System Tray menu to quickly show/hide, toggle pin, or exit.
  - Global Hotkey: Press **`Ctrl+Shift+K`** (or `Cmd+Shift+K`) anywhere to toggle Kokome's visibility.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
git clone https://github.com/yashwantraj147-eng/kokome.git
cd kokome
npm install
```

### Running Locally
```bash
# Launch native desktop companion
npm start

# Or launch development mode with Vite HMR
npm run dev

# Or run purely in your web browser
npm run dev:web
```

On Windows, you can also double-click **`run-kokome.bat`** in the project root to launch the companion anytime!

---

## 🛠️ Architecture

```
kokome/
├── electron/
│   ├── main.cjs         # Electron main process (IPC telemetry, tray, notifications, hotkeys)
│   ├── preload.cjs      # Safe contextBridge exposing system stats & window controls
│   └── dev-runner.js    # Seamless Vite + Electron dev orchestrator
├── src/
│   ├── components/
│   │   ├── TitleBar.tsx        # Frameless window controls, themes & always-on-top pin
│   │   ├── KokomeMascot.tsx    # Interactive Professor Cat & Cyber Spirit avatars
│   │   ├── FocusTimer.tsx      # Pomodoro countdown, live taskbar title & celebrations
│   │   ├── SoundscapeMixer.tsx # Real-time procedural Web Audio synth
│   │   ├── SystemHUD.tsx       # Live hardware metrics (CPU/RAM/Uptime)
│   │   └── QuestPad.tsx        # Daily quests and auto-saving scratchpad
│   ├── utils/
│   │   └── audioEngine.ts      # Web Audio sound generator (SFX + loop-smoothed Ambience)
│   ├── types/
│   │   └── electron.d.ts       # Typed Electron IPC contract
│   ├── index.css               # Ultra-modern glassmorphic design system
│   └── App.tsx                 # Main application shell, state hub & persistent tab router
├── public/                     # Static assets (Cat icon, logos)
└── run-kokome.bat              # One-click desktop launcher (auto-builds if needed)
```

---

## 📜 License
MIT License. Created with love for developers who want a faithful coding companion!
