"use client";

import { useState } from "react";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  className?: string;
  textClassName?: string;
}

export default function UserAvatar({
  name,
  avatarUrl,
  className = "w-10 h-10 text-base",
  textClassName = "",
}: UserAvatarProps) {
  const [error, setError] = useState(false);
  const initial = (name || "؟").trim().charAt(0);

  if (avatarUrl && !error) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        loading="lazy"
        onError={() => setError(true)}
        className={`${className} rounded-full object-cover bg-muted shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shrink-0 ${textClassName}`}
    >
      {initial}
    </div>
  );
}
