"use client";

import * as React from "react";

interface DashboardIconProps extends React.SVGProps<SVGSVGElement> {}

export const DashboardIcon = React.forwardRef<SVGSVGElement, DashboardIconProps>(
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
        <rect x="1.5" y="1.5" width="12" height="12" rx="1" />
        <rect x="3.5" y="3.5" width="3.5" height="3.5" rx="0.5" />
        <rect x="8" y="3.5" width="3.5" height="3.5" rx="0.5" />
        <rect x="3.5" y="8" width="3.5" height="3.5" rx="0.5" />
        <rect x="8" y="8" width="3.5" height="3.5" rx="0.5" />
      </svg>
    );
  },
);

DashboardIcon.displayName = "DashboardIcon";
