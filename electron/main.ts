import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mainHandlers } from "./handlers";
import { initDB } from "./database/db";
import { logger } from "./utils/logger";
import { handleSquirrelEvent } from "./utils/squirrel-event";
import { setMainWindow } from "./utils/main-window";

if (handleSquirrelEvent()) {
  process.exit(0);
}

logger.info("Starting...");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : path.join(RENDERER_DIST, "public"); // Public files copied by Vite to renderer output

let win: BrowserWindow | null = null;

function createWindow() {
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "logo.ico"),
    width: 1024,
    height: 720,
    minWidth: 1024,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  setMainWindow(win);
  if (!isDev) win.setMenu(null);
  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    if (isDev) {
      win.loadURL("http://localhost:5173/");
    } else {
      win.webContents.on("devtools-opened", () => {
        win?.webContents.closeDevTools();
      });
      // For Electron Forge Vite plugin, use the standard pattern
      win.loadFile(path.join(__dirname, "../renderer/main_window/index.html"));
    }
  }
}

mainHandlers(ipcMain);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  try {
    await initDB();
  } catch (error) {
    logger.error("Failed to initialize the database:", error);
  }
  createWindow();
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
