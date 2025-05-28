import React from "react";
import { useUserRole } from "../../hooks/useUserRole";
import { Toggle } from "./Toggle";

interface RoleToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Component for toggling between admin and provider roles
 * Useful for development and testing
 */
export const RoleToggle: React.FC<RoleToggleProps> = ({ className = "", showLabel = true }) => {
  const { role, isAdmin, switchRole, isInitialized } = useUserRole();

  if (!isInitialized) {
    return null; // Don't render until role is initialized
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          Role: <span className="capitalize font-semibold text-purple-600">{role}</span>
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className={`text-xs ${!isAdmin ? "text-purple-600 font-medium" : "text-gray-500"}`}>
          Provider
        </span>
        <Toggle label="" checked={isAdmin} onChange={switchRole} />
        <span className={`text-xs ${isAdmin ? "text-purple-600 font-medium" : "text-gray-500"}`}>
          Admin
        </span>
      </div>
    </div>
  );
};
