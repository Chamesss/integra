import { isAuthenticated, removeUser } from "@/redux/slices/user.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useNavigate } from "react-router";
import { useToastLoader } from "./useToasterLoader";

export default function useLogout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToastLoader(false);
  const isAuth = useAppSelector(isAuthenticated);

  const logout = (message?: string) => {
    if (!isAuth) return;
    dispatch(removeUser());
    showToast(
      message ? "success" : "error",
      message || "Session expirée, veuillez vous reconnecter.",
      {
        id: "logout-toast",
        duration: 3000,
        rejectDuplication: true,
      }
    );
    navigate("/login", { replace: true });
  };

  return { logout };
}
