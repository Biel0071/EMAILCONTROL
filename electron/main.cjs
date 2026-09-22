const { app, BrowserWindow, shell, ipcMain, Menu } = require('electron');
const path = require('path');
const http = require('http');

// Configure User Data Path so tokens & cache are stored safely in AppData
const userDataPath = app.getPath('userData');
process.env.USER_DATA_PATH = userDataPath;
process.env.ELECTRON_PACKAGED = app.isPackaged ? 'true' : 'false';
process.env.PORT = process.env.PORT || '1000';

console.log(`[Electron Main] Iniciando IUS Email Control`);
console.log(`[Electron Main] User Data Path: ${userDataPath}`);
console.log(`[Electron Main] Packaged: ${app.isPackaged}`);

// Start embedded Express server
let serverStarted = false;
try {
  // In packaged app or local build, load compiled dist-server/index.cjs
  const serverPath = path.join(__dirname, '../dist-server/index.cjs');
  require(serverPath);
  serverStarted = true;
  console.log(`[Electron Main] Servidor interno Express carregado com sucesso.`);
} catch (err) {
  console.error(`[Electron Main] Falha ao carregar servidor interno:`, err);
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    title: 'IUS Email Control — Enterprise Platform',
    backgroundColor: '#0a0d0e',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Remove default menu bar for a clean, professional enterprise application feel
  Menu.setApplicationMenu(null);

  // Intercept new window creations (e.g. Google OAuth or external links)
  // and force them into the OS default browser (Chrome, Edge, Firefox)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log(`[Electron] Abrindo link externo no navegador do sistema: ${url}`);
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Intercept in-window navigation to external sites (like accounts.google.com)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isLocal = url.startsWith('http://localhost:') || url.startsWith('http://127.0.0.1:');
    if (!isLocal) {
      event.preventDefault();
      console.log(`[Electron] Redirecionando navegação externa para navegador do sistema: ${url}`);
      shell.openExternal(url);
    }
  });

  // When window regains focus (e.g. user returns from browser after OAuth login),
  // notify frontend to check authentication state immediately
  mainWindow.on('focus', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('app-focused');
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load local server with automatic retry until Express is listening
  const targetUrl = `http://localhost:${process.env.PORT}`;
  loadUrlWithRetry(mainWindow, targetUrl, 30);
}

function loadUrlWithRetry(win, url, maxRetries = 30, retryDelayMs = 400) {
  let attempts = 0;

  function tryLoad() {
    attempts++;
    http.get(url, (res) => {
      if (win && !win.isDestroyed()) {
        console.log(`[Electron] Servidor local online após ${attempts} tentativa(s). Carregando interface...`);
        win.loadURL(url);
      }
    }).on('error', (err) => {
      if (attempts < maxRetries) {
        setTimeout(tryLoad, retryDelayMs);
      } else {
        console.error(`[Electron] Não foi possível conectar ao servidor local após ${maxRetries} tentativas:`, err.message);
        if (win && !win.isDestroyed()) {
          win.loadURL(url); // Try anyway so standard browser error shows
        }
      }
    });
  }

  tryLoad();
}

// App lifecycle
app.whenReady().then(() => {
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

// IPC handlers
ipcMain.handle('get-version', () => {
  return app.getVersion();
});

ipcMain.handle('focus-app', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});
