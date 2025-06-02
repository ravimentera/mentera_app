import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "accent";
}

export function Badge({ children, variant = "primary", className, ...props }: BadgeProps) {
  const variantClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    outline: "border border-current text-gray-500",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-50 text-blue-600",
    accent: "bg-blue-50 text-blue-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
