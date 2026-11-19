import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-md select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-[#743a44] shadow-xs border border-transparent",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-[#eddcd3] active:bg-[#e4cdc2] border border-border",
      outline:
        "border border-border bg-card text-foreground hover:bg-muted active:bg-[#e8ded5] shadow-xs",
      ghost:
        "text-foreground hover:bg-muted active:bg-[#e8ded5]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
