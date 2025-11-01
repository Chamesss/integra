import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  className?: string;
  size?: "xs" | "sm" | "default" | "lg" | "xl";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "success"
    | "warning"
    | "ghost"
    | "black"
    | "premium";
}

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-transparent data-[state=checked]:bg-primary data-[state=unchecked]:bg-input hover:data-[state=checked]:bg-primary/90 hover:data-[state=unchecked]:bg-input/80",
        destructive:
          "border-transparent data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input hover:data-[state=checked]:bg-destructive/90 hover:data-[state=unchecked]:bg-input/80",
        outline:
          "border-input bg-background data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=unchecked]:bg-transparent hover:bg-accent hover:data-[state=checked]:bg-primary/90",
        secondary:
          "border-transparent data-[state=checked]:bg-secondary data-[state=unchecked]:bg-input hover:data-[state=checked]:bg-secondary/80 hover:data-[state=unchecked]:bg-input/80",
        success:
          "border-transparent data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-input hover:data-[state=checked]:bg-green-500/90 hover:data-[state=unchecked]:bg-input/80",
        warning:
          "border-transparent data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-input hover:data-[state=checked]:bg-yellow-500/90 hover:data-[state=unchecked]:bg-input/80",
        ghost:
          "border-input data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=unchecked]:bg-transparent data-[state=unchecked]:border-muted hover:data-[state=checked]:bg-accent/80 hover:data-[state=unchecked]:bg-muted/50",
        black:
          "border-transparent data-[state=checked]:bg-black data-[state=unchecked]:bg-input hover:data-[state=checked]:bg-black/90 hover:data-[state=unchecked]:bg-input/80",
        premium:
          "border-transparent data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500 data-[state=unchecked]:bg-input hover:data-[state=checked]:from-purple-600 hover:data-[state=checked]:to-pink-600 hover:data-[state=unchecked]:bg-input/80",
      },
      size: {
        xs: "h-3 w-6",
        sm: "h-4 w-7",
        default: "h-6 w-11",
        lg: "h-7 w-12",
        xl: "h-8 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        xs: "size-2.5 data-[state=checked]:translate-x-3",
        sm: "size-3 data-[state=checked]:translate-x-3",
        default: "size-5 data-[state=checked]:translate-x-5",
        lg: "size-5 data-[state=checked]:translate-x-5",
        xl: "size-6 data-[state=checked]:translate-x-6",
      },
      variant: {
        default: "bg-background",
        destructive: "bg-background",
        outline: "bg-background data-[state=checked]:bg-primary-foreground",
        secondary: "bg-background",
        success: "bg-background",
        warning: "bg-background",
        ghost: "bg-foreground data-[state=checked]:bg-accent-foreground",
        black: "bg-background",
        premium: "bg-background shadow-xl",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

function Switch({
  className,
  size = "default",
  variant = "default",
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(switchVariants({ variant, size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className={cn(thumbVariants({ size, variant }))} />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

// Usage examples:
// <Switch size="xs" variant="success" />
// <Switch size="lg" variant="premium" />
// <Switch size="xl" variant="outline" />
// <Switch variant="ghost" />
// <Switch size="sm" variant="warning" />
// <Switch variant="black" /> // Pure black variant
