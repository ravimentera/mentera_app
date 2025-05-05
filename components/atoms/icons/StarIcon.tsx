"use client";

import * as React from "react";

interface StarIconProps extends React.SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export const StarIcon = React.forwardRef<SVGSVGElement, StarIconProps>(
  ({ filled = false, className = "", ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 15 15"
        width="15"
        height="15"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        <path d="M7.5 1.5l1.902 3.853 4.248.618-3.075 2.997.726 4.232L7.5 11.25l-3.801 1.95.726-4.232-3.075-2.997 4.248-.618L7.5 1.5z" />
      </svg>
    );
  },
);

StarIcon.displayName = "StarIcon";
