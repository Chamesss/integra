// main/ipcAuth.ts
import { getMainWindow } from "../utils/main-window";
import { JWT_SECRET } from "../config";
import { ipcMain, IpcMainInvokeEvent } from "electron";
import jwt from "jsonwebtoken";

class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function createWithAuth() {
  async function requestToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      const mainWindow = getMainWindow();
      if (!mainWindow) {
        reject(new Error("Main window is not available"));
        return;
      }
      mainWindow?.webContents.send("auth:request-token");

      ipcMain.once("auth:response-token", (_event, token) => {
        const user = verifyToken(token);
        if (user) resolve(user);
        else reject(new AuthError("Invalid token"));
      });
    });
  }

  /**
   * Wraps a handler so auth is always checked before execution
   */
  return function withAuth(
    handler: (event: IpcMainInvokeEvent, args: any) => any
  ) {
    return async (event: IpcMainInvokeEvent, args: any) => {
      await requestToken(); // ✅ middleware check
      return handler(event, args); // pass through
    };
  };
}
