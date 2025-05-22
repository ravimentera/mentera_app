"use client";

import React from "react";
export type IconBaseProps = {
  size?: number;
  className?: string;
  color?: string;
  title?: string;
  ariaHidden?: boolean;
};

// Common SVG wrapper for all icons - simpler version
export const createIconComponent = (path: React.ReactNode, displayName: string) => {
  // Use a very simple component declaration pattern
  const IconComponent = (props: IconBaseProps) => {
    const { size = 24, className = "", color = "currentColor", title, ariaHidden = true } = props;

    // Generate a unique ID for accessibility
    const titleId = title
      ? `${displayName.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`
      : undefined;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden={title ? undefined : ariaHidden}
        aria-labelledby={titleId}
      >
        {title && <title id={titleId}>{title}</title>}
        {path}
      </svg>
    );
  };

  IconComponent.displayName = displayName;
  return IconComponent;
};
