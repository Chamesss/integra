import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  title: string;
  icon: LucideIcon;
  color: string;
  badge?:
    | {
        content: ReactNode;
        variant?: "default" | "secondary" | "destructive" | "outline";
      }
    | string
    | number;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export default function InfoSection({
  title,
  icon: Icon,
  color,
  badge,
  children,
  className = "",
  headerAction,
}: Props) {
  const getIconClasses = () => {
    const colorMap: Record<string, string> = {
      purple: "bg-purple-50",
      cyan: "bg-cyan-50",
      indigo: "bg-indigo-50",
      slate: "bg-slate-50",
      blue: "bg-blue-50",
      green: "bg-green-50",
      orange: "bg-orange-50",
      pink: "bg-pink-50",
    };

    return colorMap[color] || "bg-gray-50";
  };

  const getTextIconClasses = () => {
    const colorMap: Record<string, string> = {
      purple: "text-purple-600",
      cyan: "text-cyan-600",
      indigo: "text-indigo-600",
      slate: "text-slate-600",
      blue: "text-blue-600",
      green: "text-green-600",
      orange: "text-orange-600",
      pink: "text-pink-600",
    };

    return colorMap[color] || "text-gray-600";
  };

  return (
    <Card className={`border gap-0 shadow-none ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between border-b gap-2 pb-4 text-lg font-semibold text-gray-900">
          <div className="flex items-center gap-2">
            <div className={`p-2 ${getIconClasses()} rounded-lg`}>
              <Icon className={`w-4 h-4 ${getTextIconClasses()}`} />
            </div>
            {title}
            {badge && (
              <Badge
                variant={
                  typeof badge === "object" && "variant" in badge
                    ? badge.variant || "secondary"
                    : "secondary"
                }
                className="ml-2"
              >
                {typeof badge === "object" && "content" in badge
                  ? badge.content
                  : badge}
              </Badge>
            )}
          </div>
          {headerAction}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}
