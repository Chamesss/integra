import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarItems, sidebarItemsMain } from "./constants";
import SidebarItem from "./sidebar-item";
import LogoutSidebarItem from "./logout-item";
import { companyInfo } from "@/config";

export default function SideBar() {
  const [expend, setExpend] = useState(true);

  useEffect(() => {
    window.addEventListener("resize", closeSidebar);
    return () => window.removeEventListener("resize", closeSidebar);
  }, []);

  const closeSidebar = () => {
    if (window.innerWidth > 767) {
      setExpend(false);
    }
  };
  return (
    <div
      className={cn(
        "h-screen bg-green-pale w-[4rem] shrink-0 flex-col justify-between border-r transition-all dark:bg-stone-900 md:flex xl:relative xl:w-[15rem]",
        { "w-[15rem]": expend }
      )}
    >
      <div className="mt-3 flex w-full flex-row items-center justify-between px-2 py-2.5 xl:px-4 xl:py-4">
        <div
          className={cn(
            "flex flex-row items-end gap-3 xl:w-auto",
            !expend && "w-0"
          )}
        >
          <img
            className={cn(
              "mb-1 ml-3 h-7 w-0 overflow-hidden object-contain xl:h-7 xl:w-auto",
              expend && "w-fit"
            )}
            src={companyInfo.logoSecondary}
            alt="logo"
          />
        </div>
        <Menu
          onClick={() => setExpend((prev) => !prev)}
          className={cn(
            "block h-8 w-8 translate-x-[-10px] cursor-pointer self-center rounded-xl px-1.5 py-1 transition-all hover:bg-black/5 hover:dark:bg-white/10 xl:hidden",
            expend && "w-fit translate-x-[0px]"
          )}
        />
      </div>

      <div className="scrollbar flex h-full w-full flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-4 xl:px-4">
        {sidebarItemsMain.map((item: SidebarItems) => (
          <SidebarItem expend={expend} key={item.title} item={item} />
        ))}
      </div>
      <div className="px-2 py-4 xl:px-4">
        <LogoutSidebarItem expend={expend} />
      </div>
    </div>
  );
}
