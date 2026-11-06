const { app, BrowserWindow, ipcMain, screen, Notification, Tray, Menu, globalShortcut } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');

console.log('[Kokome Main] Initializing Electron app...');

// Enforce single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('[Kokome Main] Another instance is already running. Quitting.');
  app.quit();
}

let mainWindow = null;
let tray = null;
let previousCpus = os.cpus();

const iconPath = fs.existsSync(path.join(__dirname, '../dist/icon.png'))
  ? path.join(__dirname, '../dist/icon.png')
  : path.join(__dirname, '../public/icon.png');

// State persistence
function getStateFilePath() {
  try {
    return path.join(app.getPath('userData'), 'kokome-window-state.json');
  } catch {
    return null;
  }
}

function loadWindowState() {
  const p = getStateFilePath();
  if (p && fs.existsSync(p)) {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
      console.warn('[Kokome Main] Failed to read window state:', e);
    }
  }
  return null;
}

function saveWindowState() {
  if (!mainWindow) return;
  const p = getStateFilePath();
  if (!p) return;
  try {
    const bounds = mainWindow.getBounds();
    const isPinned = mainWindow.isAlwaysOnTop();
    fs.writeFileSync(p, JSON.stringify({ ...bounds, isPinned }), 'utf8');
  } catch (e) {
    console.warn('[Kokome Main] Failed to save window state:', e);
  }
}

function getCpuUsage() {
  const currentCpus = os.cpus();
  let idleDiff = 0;
  let totalDiff = 0;

  for (let i = 0; i < currentCpus.length; i++) {
    const prev = previousCpus[i].times;
    const curr = currentCpus[i].times;

    const prevTotal = prev.user + prev.nice + prev.sys + prev.idle + (prev.irq || 0);
    const currTotal = curr.user + curr.nice + curr.sys + curr.idle + (curr.irq || 0);

    idleDiff += (curr.idle - prev.idle);
    totalDiff += (currTotal - prevTotal);
  }

  previousCpus = currentCpus;
  if (totalDiff <= 0) return 0;
  const percent = Math.max(0, Math.min(100, Math.round(((totalDiff - idleDiff) / totalDiff) * 100)));
  return percent;
}

function createTray() {
  if (tray) return;
  try {
    tray = new Tray(iconPath);
    tray.setToolTip('Kokome | Desktop Companion (Ctrl+Shift+K)');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show / Hide Kokome',
        click: () => {
          if (!mainWindow) {
            createWindow();
          } else if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: 'Always on Top',
        type: 'checkbox',
        checked: mainWindow ? mainWindow.isAlwaysOnTop() : true,
        click: (item) => {
          if (mainWindow) {
            mainWindow.setAlwaysOnTop(item.checked, 'screen-saver');
            saveWindowState();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Quit Kokome',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      if (mainWindow) {
        if (!mainWindow.isVisible()) {
          mainWindow.show();
        }
        mainWindow.focus();
      }
    });
  } catch (err) {
    console.warn('[Kokome Main] Tray creation error:', err);
  }
}

function createWindow() {
  console.log('[Kokome Main] Creating window...');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const defaultWidth = 440;
  const defaultHeight = 720;
  const defaultX = Math.max(20, screenWidth - defaultWidth - 50);
  const defaultY = Math.max(20, Math.floor((screenHeight - defaultHeight) / 2));

  const savedState = loadWindowState() || {};
  const windowWidth = savedState.width && savedState.width >= 280 ? savedState.width : defaultWidth;
  const windowHeight = savedState.height && savedState.height >= 400 ? savedState.height : defaultHeight;
  const x = typeof savedState.x === 'number' && savedState.x < screenWidth ? savedState.x : defaultX;
  const y = typeof savedState.y === 'number' && savedState.y < screenHeight ? savedState.y : defaultY;
  const isPinned = typeof savedState.isPinned === 'boolean' ? savedState.isPinned : true;

  console.log(`[Kokome Main] Screen size: ${screenWidth}x${screenHeight}. Window: ${windowWidth}x${windowHeight} at (${x}, ${y})`);

  mainWindow = new BrowserWindow({
    title: 'Kokome | Desktop Companion',
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    minWidth: 280,
    minHeight: 400,
    frame: false,
    transparent: false,
    hasShadow: true,
    resizable: true,
    alwaysOnTop: isPinned,
    skipTaskbar: false,
    icon: iconPath,
    backgroundColor: '#120c1c',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  const distPath = path.join(__dirname, '../dist/index.html');

  if (devUrl) {
    console.log('[Kokome Main] Loading Dev URL:', devUrl);
    mainWindow.loadURL(devUrl);
  } else if (fs.existsSync(distPath)) {
    console.log('[Kokome Main] Loading Dist file:', distPath);
    mainWindow.loadFile(distPath);
  } else {
    console.log('[Kokome Main] Dist not found, loading fallback URL http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
  }

  let saveTimer = null;
  const debouncedSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveWindowState, 500);
  };

  mainWindow.on('resize', debouncedSave);
  mainWindow.on('move', debouncedSave);

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Kokome Main] Window content loaded successfully!');
  });

  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
    console.error(`[Kokome Main] Failed to load: code ${code}, desc ${desc}`);
  });

  mainWindow.show();
  mainWindow.focus();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createTray();
}

// Window control IPCs
ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window:close', () => {
  saveWindowState();
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:set-always-on-top', (_event, flag) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(flag, 'screen-saver');
    saveWindowState();
    return mainWindow.isAlwaysOnTop();
  }
  return false;
});

ipcMain.handle('window:get-always-on-top', () => {
  if (mainWindow) {
    return mainWindow.isAlwaysOnTop();
  }
  return false;
});

ipcMain.handle('window:set-size', (_event, { width, height }) => {
  if (mainWindow) {
    mainWindow.setSize(width, height, true);
    saveWindowState();
    return true;
  }
  return false;
});

// Native Notification IPC
ipcMain.on('notification:show', (_event, { title, body }) => {
  try {
    if (Notification.isSupported()) {
      new Notification({
        title: title || 'Kokome',
        body: body || '',
        icon: iconPath
      }).show();
    }
  } catch (err) {
    console.warn('[Kokome Main] Notification error:', err);
  }
});

// System telemetry IPC
ipcMain.handle('system:get-stats', () => {
  const cpuPercent = getCpuUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercent = Math.round((usedMem / totalMem) * 100);
  const uptime = os.uptime();
  const cpus = os.cpus();
  const cpuModel = cpus && cpus[0] ? cpus[0].model.trim() : 'System CPU';
  const cpuCores = cpus ? cpus.length : 1;

  return {
    cpuPercent,
    cpuModel,
    cpuCores,
    totalMemBytes: totalMem,
    freeMemBytes: freeMem,
    usedMemBytes: usedMem,
    memPercent,
    uptimeSeconds: uptime,
    platform: os.platform(),
    hostname: os.hostname()
  };
});

if (gotTheLock) {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    console.log('[Kokome Main] app.whenReady fired');
    createWindow();

    // Global shortcut to show/hide Kokome anytime
    try {
      globalShortcut.register('CommandOrControl+Shift+K', () => {
        if (!mainWindow) {
          createWindow();
        } else if (mainWindow.isVisible()) {
          if (mainWindow.isFocused()) {
            mainWindow.hide();
          } else {
            mainWindow.focus();
          }
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      });
    } catch (e) {
      console.warn('[Kokome Main] Failed to register global shortcut:', e);
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
