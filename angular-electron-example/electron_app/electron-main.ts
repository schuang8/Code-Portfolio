import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
const Store = require('electron-store');

const store = new Store();

let win: BrowserWindow;

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');
let appUrl;
if (serve) {
  appUrl = url.format({
    pathname: 'localhost:4200/index.html',
    protocol: 'http:',
    slashes: true
  });
} else {
  appUrl = url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true
  });
}

ipcMain.on('reload', () => {
  win.reload();
});

function createWindow() {
  const minWindowWidth = 790;
  const minWindowHeight = 530;

  // Window aspect ratio 16:9
  let windowWidth = 1366;
  let windowHeight = 768;
  // Position of window. When undefined it gets centered
  let windowX;
  let windowY;
  let isMaximized;

  const prevBounds = store.get('winBounds');
  if (prevBounds) {
    windowWidth = prevBounds.width;
    windowHeight = prevBounds.height;
    windowX = prevBounds.x;
    windowY = prevBounds.y;
    isMaximized = prevBounds.isMaximized;
  }

  // Create the browser window.
  win = new BrowserWindow({
    frame: false,
    width: windowWidth,
    height: windowHeight,
    x: windowX,
    y: windowY,
    minWidth: minWindowWidth,
    minHeight: minWindowHeight,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true
    }
  });

  win.webContents.on('new-window', (event: any, contentUrl: string, frameName, disposition, options, additionalFeatures) => {
    event.preventDefault();

    const browser = new BrowserWindow(options);
    browser.setMenu(null);

    browser.once('ready-to-show', () => {
      browser.show();
    });

    event.newGuest = browser;
  });

  win.on('ready-to-show', () => {
    if (isMaximized) {
      win.maximize();
    }
    win.show();
  });

  win.loadURL(appUrl);

  win.on('close', () => {
    store.set('winBounds', { ...win.getNormalBounds(), isMaximized: win.isMaximized() });
  });

  win.on('closed', () => {
    win = null;
  });

  win.on('focus', () => {
    win.webContents.send('win-on-focus');
  });
}

function start() {
  createWindow();
}

try {
  if (!app.requestSingleInstanceLock()) {
    app.quit();
  } else {
    app.on('second-instance', () => {
      if (win) {
        if (win.isMinimized()) {
          win.restore();
        }
        win.focus();
      }
    });
    app.on('ready', () => {
      start();
    });
  }

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
