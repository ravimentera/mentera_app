"use client";

import * as React from "react";

interface MailIconProps extends React.SVGProps<SVGSVGElement> {}

export const MailIcon = React.forwardRef<SVGSVGElement, MailIconProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        ref={ref}
        {...props}
      >
        <path
          d="M13.3334 2.66797H2.66671C1.93033 2.66797 1.33337 3.26492 1.33337 4.0013V12.0013C1.33337 12.7377 1.93033 13.3346 2.66671 13.3346H13.3334C14.0698 13.3346 14.6667 12.7377 14.6667 12.0013V4.0013C14.6667 3.26492 14.0698 2.66797 13.3334 2.66797Z"
          fill="currentColor"
        />
        <path
          d="M14.6667 4.66797L8.68671 8.46797C8.48089 8.59692 8.24292 8.66531 8.00004 8.66531C7.75716 8.66531 7.51919 8.59692 7.31337 8.46797L1.33337 4.66797"
          fill="currentColor"
        />
        <path
          d="M14.6667 4.66797L8.68671 8.46797C8.48089 8.59692 8.24292 8.66531 8.00004 8.66531C7.75716 8.66531 7.51919 8.59692 7.31337 8.46797L1.33337 4.66797M2.66671 2.66797H13.3334C14.0698 2.66797 14.6667 3.26492 14.6667 4.0013V12.0013C14.6667 12.7377 14.0698 13.3346 13.3334 13.3346H2.66671C1.93033 13.3346 1.33337 12.7377 1.33337 12.0013V4.0013C1.33337 3.26492 1.93033 2.66797 2.66671 2.66797Z"
          stroke="white"
          stroke-width="0.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    );
  },
);

MailIcon.displayName = "MailIcon";
