"use client";

import { GoogleIcon } from "./GoogleIcon";
import { MenteraIcon } from "./MenteraIcon";
import { StarIcon } from "./StarIcon";
import { SuccessIcon } from "./SuccessIcon";
import { IconName } from "./types";

// Props interface that matches Radix UI icons styling
interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  filled?: boolean; // For StarIcon
}

// Custom icon component for icons not available in Radix UI
export function Icon({
  name,
  width = 15,
  height = 15,
  color = "currentColor",
  className = "",
  filled = false,
}: IconProps & { name: IconName }) {
  const props = {
    width,
    height,
    className,
    style: { color },
  };

  switch (name) {
    case IconName.SPA:
      return <MenteraIcon {...props} />;
    case IconName.STAR:
      return <StarIcon {...props} filled={filled} />;
    case IconName.SUCCESS:
      return <SuccessIcon {...props} />;
    case IconName.GOOGLE:
      return <GoogleIcon {...props} />;
    default:
      console.warn(`Icon '${name}' not found`);
      return null;
  }
}
