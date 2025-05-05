"use client";

import * as React from "react";

interface MenteraIconProps extends React.SVGProps<SVGSVGElement> {}

export const MenteraIcon = React.forwardRef<SVGSVGElement, MenteraIconProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 15 15"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        <path d="M11.5 12.5V5.5c0-2.25-2-4-4.5-4s-4.5 1.75-4.5 4v2.5" />
        <path d="M3.5 7.5c0-2.25 2-4 4.5-4" />
        <circle cx="3.5" cy="7.5" r="0.5" />
        <path d="M11.5 12.5l-1.5-3" />
        <path d="M11.5 12.5l1.5-3" />
      </svg>
    );
  },
);

MenteraIcon.displayName = "MenteraIcon";
