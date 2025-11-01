import { User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientIconProps {
  type: "individual" | "company";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ClientIcon({
  type,
  size = "md",
  className,
}: ClientIconProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={cn(
        "bg-blue-100 rounded-full flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      {type === "individual" ? (
        <User className={cn("text-blue-600", iconSizes[size])} />
      ) : (
        <Building2 className={cn("text-blue-600", iconSizes[size])} />
      )}
    </div>
  );
}
