"use client";

import * as React from "react";

interface SuccessIconProps extends React.SVGProps<SVGSVGElement> {}

export const SuccessIcon = React.forwardRef<SVGSVGElement, SuccessIconProps>(
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
        <path d="M13.5 7.5a6 6 0 1 1-3-5.2" />
        <polyline points="13.5 2.5 7.5 8.5 6 7" />
      </svg>
    );
  },
);

SuccessIcon.displayName = "SuccessIcon";
