/**
 * Safe Storage Utility
 * Prevents application crashes from:
 * - Blocked / restricted storage in iframe sandbox
 * - Private / Incognito browsing quota restrictions
 * - Corrupted / malformed JSON strings
 * - DOMException / SecurityError
 */

const memoryFallback: Record<string, string> = {};
const sessionMemoryFallback: Record<string, string> = {};

export function safeGetItem(key: string, defaultValue: string | null = null): string | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return memoryFallback[key] ?? defaultValue;
    }
    const val = window.localStorage.getItem(key);
    return val !== null ? val : defaultValue;
  } catch (err) {
    return memoryFallback[key] ?? defaultValue;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    memoryFallback[key] = value;
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch (err) {
    // Storage quota exceeded or disabled; memory fallback is updated
  }
  return false;
}

export function safeRemoveItem(key: string): boolean {
  try {
    delete memoryFallback[key];
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
      return true;
    }
  } catch (err) {}
  return false;
}

export function safeGetJSON<T>(key: string, defaultValue: T | null = null): T | null {
  const raw = safeGetItem(key);
  if (!raw) return defaultValue;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[SafeStorage] Malformed JSON for key "${key}", purging invalid state:`, err);
    safeRemoveItem(key);
    return defaultValue;
  }
}

export function safeSetJSON<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    return safeSetItem(key, serialized);
  } catch (err) {
    console.warn(`[SafeStorage] Failed to serialize JSON for key "${key}":`, err);
    return false;
  }
}

export function safeSessionGetItem(key: string, defaultValue: string | null = null): string | null {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return sessionMemoryFallback[key] ?? defaultValue;
    }
    const val = window.sessionStorage.getItem(key);
    return val !== null ? val : defaultValue;
  } catch (err) {
    return sessionMemoryFallback[key] ?? defaultValue;
  }
}

export function safeSessionSetItem(key: string, value: string): boolean {
  try {
    sessionMemoryFallback[key] = value;
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
      return true;
    }
  } catch (err) {}
  return false;
}

export function safeSessionRemoveItem(key: string): boolean {
  try {
    delete sessionMemoryFallback[key];
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
      return true;
    }
  } catch (err) {}
  return false;
}

export function clearAppSessionCaches(): void {
  try {
    const keysToRemove = [
      "maa_token",
      "maa_user",
      "mentorhub_intro_seen",
      "mentorhub_intro_walkthrough_seen",
    ];
    keysToRemove.forEach((k) => {
      safeRemoveItem(k);
      safeSessionRemoveItem(k);
    });

    // Clean offline cache prefixes
    if (typeof window !== "undefined" && window.localStorage) {
      const allKeys = Object.keys(window.localStorage);
      allKeys.forEach((k) => {
        if (k.startsWith("mh_offline_cache:") || k.startsWith("maa_avatar_")) {
          safeRemoveItem(k);
        }
      });
    }
  } catch (err) {
    console.warn("[SafeStorage] Cache reset notice:", err);
  }
}
