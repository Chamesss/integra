import { cn } from "@/lib/utils";
import { useLocation, useNavigate, useNavigation } from "react-router";
import { SidebarItems } from "./constants";

const sidebarTheme = {
  base: "group w-fit active:scale-95 cursor-pointer rounded-xs border border-transparent px-2 py-1.5 transition-all xl:w-full",

  active: "bg-green-dark text-black hover:bg-green-dark/90 hover:text-white",
  inactive: "hover:bg-white/10",

  disabled: "pointer-events-none cursor-not-allowed opacity-50",

  icon: {
    base: "shrink-0 p-1 text-neutral-400 transition-all group-hover:text-actionButton",
    active: "rounded-md bg-actionButton text-white group-hover:text-white",
  },

  label: {
    base: "w-0 overflow-hidden text-white truncate text-nowrap text-sm font-normal opacity-0 transition-all xl:w-auto xl:opacity-100",
    active: "text-white",
  },
};

interface Props {
  item: SidebarItems;
  expend: boolean;
}

export default function SidebarItem({ item, expend }: Props) {
  const Icon = item.Icon;
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();

  const getIsPathActive = (url: string) => {
    const currentPathname =
      navigation.state === "loading"
        ? navigation.location.pathname
        : location.pathname;
    if (currentPathname === "/") return url === "/";
    return currentPathname.includes(url) && url !== "/";
  };

  const active = getIsPathActive(item.url);

  return (
    <ul
      onClick={() => navigate(item.url)}
      className={cn(
        sidebarTheme.base,
        active ? sidebarTheme.active : sidebarTheme.inactive,
        item.disabled && sidebarTheme.disabled,
        expend && "w-full"
      )}
    >
      <li
        className={cn(
          "flex flex-row items-center gap-0 xl:gap-4",
          expend && "gap-4!"
        )}
      >
        <Icon
          size={26}
          className={cn(
            sidebarTheme.icon.base,
            active && sidebarTheme.icon.active
          )}
        />
        <span
          className={cn(
            sidebarTheme.label.base,
            expend && "w-fit opacity-100",
            active && sidebarTheme.label.active
          )}
        >
          {item.title}
        </span>
      </li>
    </ul>
  );
}
