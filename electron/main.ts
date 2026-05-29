import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
autoUpdater.logger = log
log.transports.file.level = 'info'

autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

function createWindow() {
  const win = new BrowserWindow({
    width: 1450,
    height: 990,
    frame: false,
    icon: join(__dirname, '../resources/icon.ico'),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  ipcMain.on('win-minimize', () => win.minimize())
  ipcMain.on('win-maximize', () => {
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.on('win-close', () => win.close())
  ipcMain.handle('get-version', () => app.getVersion())

  // ─── IPC do updater ───────────────────────────────────────────────
  ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) return null
    try {
      const result = await autoUpdater.checkForUpdates()
      return { version: result?.updateInfo?.version ?? null }
    } catch {
      return null
    }
  })

  ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall()
  })

  // ─── Eventos do autoUpdater → renderer ────────────────────────────
  autoUpdater.on('checking-for-update', () => {
    win.webContents.send('update-checking')
  })
  autoUpdater.on('update-available', (info) => {
    win.webContents.send('update-available', info)
  })
  autoUpdater.on('update-not-available', () => {
    win.webContents.send('update-not-available')
  })
  autoUpdater.on('download-progress', (progress) => {
    win.webContents.send('update-progress', progress)
  })
  autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('update-downloaded', info)
  })
  autoUpdater.on('error', (err) => {
    win.webContents.send('update-error', err.message)
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'))
  }

  // Verifica atualização ao abrir (só em produção)
  win.webContents.on('did-finish-load', () => {
    if (app.isPackaged) {
      autoUpdater.checkForUpdates()
    }
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
