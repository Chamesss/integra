import { ipcRenderer } from "electron";

export const preloadAuth = () => {
  const user = localStorage.getItem("persist:root");
  if (user) {
    const parsed = JSON.parse(user);
    const userState = JSON.parse(parsed.user || "{}");
    if (userState.tokens?.accessToken) {
      ipcRenderer.send("auth:response-token", userState.tokens?.accessToken);
      return;
    }
  }
  ipcRenderer.send("auth:response-token", null);
};
