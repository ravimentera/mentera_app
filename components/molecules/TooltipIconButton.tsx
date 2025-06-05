"use client";

import { ComponentPropsWithoutRef, forwardRef } from "react";

import { Button, Tooltip } from "@/components/atoms";
import { cn } from "@/lib/utils";

export type TooltipIconButtonProps = ComponentPropsWithoutRef<typeof Button> & {
  tooltip: string;
  side?: "top" | "bottom" | "left" | "right";
};

export const TooltipIconButton = forwardRef<HTMLButtonElement, TooltipIconButtonProps>(
  ({ children, tooltip, side = "bottom", className, ...rest }, ref) => {
    return (
      <Tooltip content={tooltip} side={side}>
        <Button
          variant="ghost"
          size="icon"
          {...rest}
          className={cn("size-6 p-1", className)}
          ref={ref}
        >
          {children}
          <span className="sr-only">{tooltip}</span>
        </Button>
      </Tooltip>
    );
  },
);

TooltipIconButton.displayName = "TooltipIconButton";
