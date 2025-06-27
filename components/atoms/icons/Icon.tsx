"use client";

import { GoogleIcon } from "./GoogleIcon";
import { MailIcon } from "./MailIcon";
import { MenteraLogoIcon } from "./MenteraLogoIcon";
import { MessageSquareIcon } from "./MessageSquareIcon";
import { RobotIcon } from "./RobotIcon";
import { ScheduleIcon } from "./ScheduleIcon";
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
      return <MenteraLogoIcon {...props} />;
    case IconName.STAR:
      return <StarIcon {...props} filled={filled} />;
    case IconName.SUCCESS:
      return <SuccessIcon {...props} />;
    case IconName.GOOGLE:
      return <GoogleIcon {...props} />;
    case IconName.ROBOT:
      return <RobotIcon {...props} />;
    case IconName.MESSAGE_SQUARE:
      return <MessageSquareIcon {...props} />;
    case IconName.MAIL:
      return <MailIcon {...props} />;
    case IconName.SCHEDULE:
      return <ScheduleIcon {...props} />;
    default:
      console.warn(`Icon '${name}' not found`);
      return null;
  }
}
