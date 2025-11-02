import { cn } from "@/lib/utils";
import { DoorOpen } from "lucide-react";
import useLogout from "@/hooks/useLogout";

export default function LogoutSidebarItem({ expend }: { expend: boolean }) {
  const { logout } = useLogout();

  return (
    <ul
      onClick={() => logout("Vous avez été déconnecté avec succès.")}
      className={cn(
        "group w-fit active:scale-95 cursor-pointer rounded-xs border border-transparent px-2 py-1.5 transition-all hover:bg-white/10 xl:w-full",
        { "w-full": expend }
      )}
    >
      <li
        className={cn(
          "flex flex-row items-center gap-0 xl:gap-4",
          expend && "gap-4!"
        )}
      >
        <DoorOpen
          size={26}
          className={cn(
            "shrink-0 p-1 text-neutral-400 transition-all group-hover:text-actionButton"
          )}
        />
        <span
          className={cn(
            "w-0 overflow-hidden text-white text-nowrap text-sm font-normal opacity-0 transition-all xl:w-auto xl:opacity-100",
            expend && "w-fit opacity-100"
          )}
        >
          Déconnexion
        </span>
      </li>
    </ul>
  );
}
