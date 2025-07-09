import React from "react";

export const Link = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <span
      onClick={props.onClick}
      className="text-interactive underline-offset-4 hover:underline text-sm cursor-pointer font-medium"
    >
      {children}
    </span>
  );
};
