import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  children?: React.ReactNode;
  className?: string;
}

export default function SectionTitle({ children, className }: Props) {
  return (
    <div className={cn("text-xl w-fit font-semibold mb-4", className)}>
      {children}
    </div>
  );
}
