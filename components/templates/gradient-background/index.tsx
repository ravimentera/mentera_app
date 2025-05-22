import React from "react";

interface GradientBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  gradientColors?: {
    primary: string;
    secondary: string;
    secondaryPosition?: number;
  };
  colorDirection?: "horizontal" | "vertical" | "diagonal";
  fadeDirection?: "top" | "bottom" | "left" | "right" | "none";
  children?: React.ReactNode;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  className = "",
  style = {},
  gradientColors = {
    primary: "rgba(143, 3, 160, 0.8)",
    secondary: "rgba(110, 241, 187, 0.8)",
    secondaryPosition: 80,
  },
  colorDirection = "horizontal",
  fadeDirection = "top",
  children,
}) => {
  const getFadeGradient = () => {
    if (fadeDirection === "none") return "";

    const directions: Record<string, string> = {
      top: "180deg",
      bottom: "0deg",
      left: "90deg",
      right: "270deg",
    };

    const direction = directions[fadeDirection];

    return `
      linear-gradient(${direction}, 
        #FFFFFF 0%,
        rgba(255, 255, 255, 0.9) 40%,
        rgba(255, 255, 255, 0.7) 70%,
        rgba(255, 255, 255, 0.3) 90%,
        rgba(255, 255, 255, 0) 100%
      )
    `;
  };

  const getColorGradient = () => {
    const { primary, secondary, secondaryPosition } = gradientColors;
    const directions: Record<string, string> = {
      horizontal: "90deg",
      vertical: "180deg",
      diagonal: "135deg",
    };

    const direction = directions[colorDirection];

    return `
      linear-gradient(${direction}, 
        ${primary} 0%,
        ${secondary} ${secondaryPosition}%
      )
    `;
  };

  const backgroundStyle = {
    ...style,
    background:
      fadeDirection === "none" ? getColorGradient() : `${getFadeGradient()}, ${getColorGradient()}`,
    backgroundSize: "100% 100%",
  };

  return (
    <div className={`absolute inset-0 ${className}`} style={backgroundStyle}>
      {children}
    </div>
  );
};

export default GradientBackground;
