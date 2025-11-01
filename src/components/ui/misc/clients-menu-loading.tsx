import { cn } from "@/lib/utils";
import { Skeleton } from "../skeleton";

interface Props {
  className?: string;
  size?: "sm" | "default";
}

export default function ClientsMenuLoading({
  className,
  size = "default",
}: Props) {
  const variantSize = {
    avatar: size === "sm" ? "w-8 h-8" : "w-10 h-10",
    title: size === "sm" ? "h-3" : "h-4",
    description: size === "sm" ? "h-2" : "h-3",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 last:border-none border-b border-gray-100",
        className
      )}
    >
      <Skeleton
        className={cn(
          "bg-gray-200 rounded-full animate-pulse flex-shrink-0",
          variantSize.avatar
        )}
      />
      <div className="flex-1 space-y-2">
        <Skeleton
          className={cn("bg-gray-200 rounded animate-pulse", variantSize.title)}
        />
        <Skeleton
          className={cn(
            "bg-gray-100 rounded animate-pulse",
            variantSize.description
          )}
        />
      </div>
    </div>
  );
}
