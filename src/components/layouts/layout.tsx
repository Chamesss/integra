import { Outlet, useNavigation } from "react-router";
import SideBar from "../sidebar/sidebar";
import useSyncWithWoo from "@/hooks/useSetupProccess";
import LoadingPage from "@/pages/fallback/loading";

export default function Layout() {
  useSyncWithWoo();
  const navigation = useNavigation();
  const isPageLoading = navigation.state === "loading";

  return (
    <div className="flex h-screen w-full flex-row font-inter">
      <SideBar />
      <div className="relative bg-gray-pale scrollbar h-screen overflow-auto flex flex-1 flex-col justify-between">
        {isPageLoading ? <LoadingPage /> : <Outlet />}
      </div>
    </div>
  );
}
