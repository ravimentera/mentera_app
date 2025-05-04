"use client";

import * as React from "react";

interface RobotIconProps extends React.SVGProps<SVGSVGElement> {}

export const RobotIcon = React.forwardRef<SVGSVGElement, RobotIconProps>(
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
        <rect x="2.5" y="4.5" width="10" height="8" rx="1" />
        <rect x="4.5" y="7.5" width="2" height="2" rx="0.5" />
        <rect x="8.5" y="7.5" width="2" height="2" rx="0.5" />
        <path d="M5.5 11.5h4" />
        <path d="M7.5 4.5v-2" />
        <path d="M5 2.5h5" />
      </svg>
    );
  },
);

RobotIcon.displayName = "RobotIcon";
