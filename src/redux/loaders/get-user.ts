import { store } from "@/redux/store";
import { AuthSession } from "@/types/enums/auth-session.enum";
import { removeUser } from "../slices/user.slice";
import { redirect } from "react-router";
import { waitForStoreRehydration } from "@electron/shared/store-hydration";

export async function getUser() {
  const accessToken = await waitForStoreRehydration();
  const logout = () => {
    store.dispatch(removeUser());
    throw redirect("/login");
  };

  if (!accessToken) logout();

  const response = await window.ipcRenderer.invoke("user:get", accessToken);
  if (!response || !response.data?.id) logout();

  return AuthSession.Valid;
}
