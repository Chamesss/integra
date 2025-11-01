import { cn } from "@/lib/utils";
import { useLocation, useNavigate, useNavigation } from "react-router";
import { SidebarItems } from "./constants";

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

  return (
    <ul
      onClick={() => navigate(item.url)}
      className={cn(
        "group w-fit active:scale-95 cursor-pointer rounded-md border border-transparent px-2 py-1.5 transition-all hover:bg-actionButton/10 xl:w-full",
        { "pointer-events-none cursor-not-allowed opacity-50": item.disabled },
        { "bg-black text-white hover:bg-black/90": getIsPathActive(item.url) },
        { "hover:bg-black/5": !getIsPathActive(item.url) },
        { "w-full": expend }
      )}
    >
      <li
        className={cn(
          "flex flex-row items-center gap-0 xl:gap-4",
          expend && "!gap-4"
        )}
      >
        <Icon
          size={26}
          className={cn(
            "shrink-0 p-1 text-neutral-500 transition-all group-hover:text-actionButton",
            {
              "rounded-md bg-actionButton text-white group-hover:text-white":
                getIsPathActive(item.url),
            }
          )}
        />
        <span
          className={cn(
            "w-0 overflow-hidden truncate text-nowrap text-sm font-normal opacity-0 transition-all xl:w-auto xl:opacity-100",
            expend && "w-fit opacity-100",
            getIsPathActive(item.url) && "text-white"
          )}
        >
          {item.title}
        </span>
      </li>
    </ul>
  );
}
