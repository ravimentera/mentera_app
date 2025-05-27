import React from "react";
import { Avatar } from "../../types/user.types";

interface UserAvatarProps {
  avatar?: Avatar;
  name: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name,
  size = "small",
  className = "",
}) => {
  const sizeClasses = {
    small: "w-10 h-10",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  const getImageUrl = () => {
    if (!avatar) return undefined;

    switch (size) {
      case "small":
        return avatar.thumbnail || avatar.medium || avatar.large;
      case "large":
        return avatar.large || avatar.medium || avatar.thumbnail;
      default:
        return avatar.medium || avatar.large || avatar.thumbnail;
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback to initials if image fails to load
    const target = e.target as HTMLImageElement;
    target.style.display = "none";

    // Show initials fallback
    const fallback = target.nextElementSibling as HTMLElement;
    if (fallback) {
      fallback.style.display = "flex";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const imageUrl = getImageUrl();

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${name}'s avatar`}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
          onError={handleImageError}
        />
      ) : null}
      {/* Fallback initials */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-purple-500 text-white font-semibold items-center justify-center border-2 border-gray-200 absolute top-0 left-0 ${!imageUrl ? "flex" : "hidden"}`}
        style={{ fontSize: size === "small" ? "0.75rem" : size === "large" ? "1.25rem" : "1rem" }}
      >
        {getInitials(name)}
      </div>
    </div>
  );
};

export default UserAvatar;
