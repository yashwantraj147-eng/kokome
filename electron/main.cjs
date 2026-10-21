const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');

console.log('[Kokome Main] Initializing Electron app...');

let mainWindow = null;
let previousCpus = os.cpus();

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

function createWindow() {
  console.log('[Kokome Main] Creating window...');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const windowWidth = 440;
  const windowHeight = 720;
  const x = Math.max(20, screenWidth - windowWidth - 50);
  const y = Math.max(20, Math.floor((screenHeight - windowHeight) / 2));

  console.log(`[Kokome Main] Screen size: ${screenWidth}x${screenHeight}. Window: ${windowWidth}x${windowHeight} at (${x}, ${y})`);

  const iconPath = fs.existsSync(path.join(__dirname, '../dist/icon.png'))
    ? path.join(__dirname, '../dist/icon.png')
    : path.join(__dirname, '../public/icon.png');

  mainWindow = new BrowserWindow({
    title: 'Kokome | Desktop Companion',
    width: windowWidth,
    height: windowHeight,
    center: true, // Center directly in the middle of the screen
    minWidth: 320,
    minHeight: 480,
    frame: false,
    transparent: false,
    hasShadow: true,
    resizable: true,
    alwaysOnTop: true, // Pop up on top of all windows
    skipTaskbar: false,
    icon: iconPath,
    backgroundColor: '#120c1c',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false
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
}

// Window control IPCs
ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:set-always-on-top', (_event, flag) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(flag, 'screen-saver');
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
    return true;
  }
  return false;
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

app.whenReady().then(() => {
  console.log('[Kokome Main] app.whenReady fired');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
