import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { PencilIcon, TrashIcon, EyeIcon } from "./icons";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface Props {
  trigger?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export default function SearchDropdownItem({
  onEdit,
  onDelete,
  onView,
  trigger,
}: Props) {
  const isOnline = useNetworkStatus();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <EllipsisVertical className="h-6 w-6 text-black hover:bg-black/10 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer p-1" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {onView && (
          <DropdownMenuItem onClick={onView}>
            {EyeIcon()}
            <span>Voir</span>
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem disabled={!isOnline} onClick={onEdit}>
            {PencilIcon()}
            <span>Modifier</span>
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem disabled={!isOnline} onClick={onDelete}>
            {TrashIcon()}
            <span>Supprimer</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
