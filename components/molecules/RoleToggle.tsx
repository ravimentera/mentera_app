import React from "react";
import { useUserRole } from "../../hooks/useUserRole";
import { ToggleSwitch } from "./ToggleSwitch";

interface RoleToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Component for toggling between admin and provider roles
 * Useful for development and testing
 */
export const RoleToggle: React.FC<RoleToggleProps> = ({ className = "", showLabel = false }) => {
  const { role, isAdmin, switchRole, isInitialized } = useUserRole();

  if (!isInitialized) {
    return null; // Don't render until role is initialized
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          Role: <span className="capitalize font-semibold text-blue-600">{role}</span>
        </span>
      )}
      <ToggleSwitch
        leftLabel="Provider"
        rightLabel="Admin"
        checked={isAdmin}
        onChange={switchRole}
      />
    </div>
  );
};
