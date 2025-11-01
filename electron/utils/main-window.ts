import { BrowserWindow } from "electron";

let mainWindow: BrowserWindow | null = null;

export function setMainWindow(win: BrowserWindow) {
  mainWindow = win;
}

export function getMainWindow(): BrowserWindow {
  if (!mainWindow) throw new Error("MainWindow not initialized yet");
  return mainWindow;
}
