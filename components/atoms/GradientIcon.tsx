import { LucideIcon } from "lucide-react";

interface GradientIconProps {
  /** The Lucide icon component to render with gradient effect */
  icon: LucideIcon;
  /** Size class for the icon (e.g., "w-4 h-4", "w-6 h-6") */
  size?: string;
  /** Custom gradient colors (default: blue gradient) */
  gradient?: string;
  /** Additional CSS classes */
  className?: string;
  /** SVG string for the mask (URL encoded) */
  svgMask?: string;
}

/**
 * A reusable component that applies a gradient effect to any Lucide icon
 * using CSS mask to preserve the icon shape while applying the gradient
 */
export function GradientIcon({
  icon: Icon,
  size = "w-4 h-4",
  gradient = "linear-gradient(to right, #200F8A, #4F9BED)",
  className = "",
  svgMask,
}: GradientIconProps) {
  return (
    <div className={`${size} relative ${className}`}>
      {/* Original icon for fallback */}
      <Icon className={size} />
      {/* Gradient overlay using mask */}
      {svgMask && (
        <div
          className={`${size} absolute inset-0`}
          style={{
            background: gradient,
            WebkitMask: `url("data:image/svg+xml,${svgMask}") center/contain no-repeat`,
            mask: `url("data:image/svg+xml,${svgMask}") center/contain no-repeat`,
          }}
        />
      )}
    </div>
  );
}

// Pre-defined SVG masks for common icons
export const SVG_MASKS = {
  WAND2:
    "%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z'/%3E%3Cpath d='m14 7 3 3'/%3E%3Cpath d='M5 6v4'/%3E%3Cpath d='M19 14v4'/%3E%3Cpath d='M10 2v2'/%3E%3Cpath d='M7 8H3'/%3E%3Cpath d='M21 16h-4'/%3E%3Cpath d='M11 3H9'/%3E%3C/svg%3E",
} as const;
