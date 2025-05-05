"use client";

import * as React from "react";

interface ScheduleIconProps extends React.SVGProps<SVGSVGElement> {}

export const ScheduleIcon = React.forwardRef<SVGSVGElement, ScheduleIconProps>(
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
        <rect x="1.5" y="2.5" width="12" height="11" rx="1" />
        <path d="M1.5 5.5h12" />
        <path d="M4.5 1.5v2" />
        <path d="M10.5 1.5v2" />
        <path d="M4.5 8.5h2" />
        <path d="M8.5 8.5h2" />
        <path d="M4.5 10.5h2" />
        <path d="M8.5 10.5h2" />
      </svg>
    );
  },
);

ScheduleIcon.displayName = "ScheduleIcon";
