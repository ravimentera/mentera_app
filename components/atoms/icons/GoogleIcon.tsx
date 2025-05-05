"use client";

import * as React from "react";

interface GoogleIconProps extends React.SVGProps<SVGSVGElement> {}

export const GoogleIcon = React.forwardRef<SVGSVGElement, GoogleIconProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 15 15"
        width="15"
        height="15"
        className={className}
        {...props}
      >
        <path
          fill="#4285F4"
          d="M14.5 7.5C14.5 7 14.45 6.505 14.35 6.045H7.5V8.635H11.43C11.235 9.515 10.71 10.245 9.93 10.73V12.49H12.29C13.65 11.245 14.5 9.545 14.5 7.5Z"
        />
        <path
          fill="#34A853"
          d="M7.5 15C9.48 15 11.14 14.335 12.29 12.49L9.93 10.73C9.275 11.175 8.445 11.43 7.5 11.43C5.57 11.43 3.932 10.155 3.345 8.41H0.905V10.23C2.045 13.095 4.545 15 7.5 15Z"
        />
        <path
          fill="#FBBC05"
          d="M3.345 8.41C3.195 7.99 3.105 7.535 3.105 7.065C3.105 6.595 3.195 6.14 3.345 5.72V3.9H0.905C0.33 4.87 0 5.935 0 7.065C0 8.195 0.33 9.26 0.905 10.23L3.345 8.41Z"
        />
        <path
          fill="#EA4335"
          d="M7.5 2.7C8.595 2.7 9.575 3.08 10.345 3.795L12.42 1.725C11.14 0.55 9.48 0 7.5 0C4.545 0 2.045 1.905 0.905 4.77L3.345 6.59C3.932 4.845 5.57 3.57 7.5 3.57V2.7Z"
        />
      </svg>
    );
  },
);

GoogleIcon.displayName = "GoogleIcon";
