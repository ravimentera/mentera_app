"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface SwitchProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, children, disabled = false, ...props }, ref) => {
    const handleClick = () => {
      onCheckedChange?.(!checked);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-brand-blue" : "bg-input dark:bg-input/80",
          disabled ? "opacity-50 pointer-events-none" : "",
          className,
        )}
        onClick={disabled ? undefined : handleClick}
        data-state={checked ? "checked" : "unchecked"}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        {...props}
      >
        {children || (
          <span
            className={cn(
              "pointer-events-none block h-4 w-4 rounded-full bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground shadow-sm ring-0 transition-transform",
              checked ? "translate-x-[calc(100%-2px)]" : "translate-x-0",
            )}
            data-state={checked ? "checked" : "unchecked"}
          />
        )}
      </div>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };
