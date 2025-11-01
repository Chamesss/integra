import React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function SectionTitle({ children, className }: Props) {
  return (
    <h1 className={`text-2xl xl:text-3xl font-bold text-gray-900 ${className}`}>
      {children}
    </h1>
  );
}
