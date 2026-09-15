import { useState, useEffect } from "react";
import { safeGetItem, safeSetItem } from "./storage";

// Application's clean neutral fallback avatar (user silhouette on neutral background)
export const NEUTRAL_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 6a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 6zm-7.5 11.25a7.5 7.5 0 0115 0v.75a8.25 8.25 0 01-15 0v-.75z' clip-rule='evenodd' /%3E%3C/svg%3E";

export const DEFAULT_AVATARS: Record<string, string> = {
  HOD: NEUTRAL_AVATAR,
  MENTOR: NEUTRAL_AVATAR,
  STUDENT: NEUTRAL_AVATAR,
  DEFAULT: NEUTRAL_AVATAR,
};

export function getUserAvatar(email?: string | null, role?: string | null, explicitAvatarUrl?: string | null): string {
  // 1. Direct database profile picture
  if (explicitAvatarUrl && typeof explicitAvatarUrl === "string" && explicitAvatarUrl.trim().length > 0) {
    return explicitAvatarUrl;
  }

  // 2. Check custom uploaded avatar in safe storage for specific user
  if (email) {
    const saved = safeGetItem(`maa_avatar_${email.toLowerCase().trim()}`);
    if (saved && saved.trim().length > 0 && !saved.includes("unsplash.com")) return saved;
  }

  // 3. Neutral fallback avatar
  return NEUTRAL_AVATAR;
}

export function setUserAvatar(email: string, avatarDataUrl: string): void {
  const key = `maa_avatar_${email.toLowerCase().trim()}`;
  safeSetItem(key, avatarDataUrl);
  safeSetItem("maa_user_avatar", avatarDataUrl);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("maa_avatar_changed", {
        detail: { email, avatarUrl: avatarDataUrl },
      })
    );
  }
}

export function useUserAvatar(email?: string | null, role?: string | null) {
  const [avatar, setAvatar] = useState<string>(() => getUserAvatar(email, role));

  useEffect(() => {
    setAvatar(getUserAvatar(email, role));

    const handleAvatarChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ email?: string; avatarUrl?: string }>;
      if (!customEvent.detail?.email || customEvent.detail.email.toLowerCase() === (email || "").toLowerCase()) {
        setAvatar(getUserAvatar(email, role));
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("maa_avatar_") || e.key === "maa_user_avatar") {
        setAvatar(getUserAvatar(email, role));
      }
    };

    window.addEventListener("maa_avatar_changed", handleAvatarChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("maa_avatar_changed", handleAvatarChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [email, role]);

  return avatar;
}
