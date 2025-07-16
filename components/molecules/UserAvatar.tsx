import Image from "next/image";
import React, { useState } from "react";
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
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: "w-10 h-10",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  const getSizeInPixels = () => {
    switch (size) {
      case "small":
        return 40;
      case "large":
        return 64;
      default:
        return 48;
    }
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const imageUrl = getImageUrl();
  const sizeInPixels = getSizeInPixels();
  const shouldShowImage = imageUrl && !imageError;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {shouldShowImage ? (
        <Image
          src={imageUrl}
          alt={`${name}'s avatar`}
          width={sizeInPixels}
          height={sizeInPixels}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onError={() => setImageError(true)}
          // Add fallback for production environments
          unoptimized={process.env.NODE_ENV === "production"}
        />
      ) : null}
      {/* Fallback initials - show when no image or image failed to load */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-blue-500 text-white font-semibold items-center justify-center absolute top-0 left-0 ${!shouldShowImage ? "flex" : "hidden"}`}
        style={{ fontSize: size === "small" ? "0.75rem" : size === "large" ? "1.25rem" : "1rem" }}
      >
        {getInitials(name)}
      </div>
    </div>
  );
};

export default UserAvatar;
