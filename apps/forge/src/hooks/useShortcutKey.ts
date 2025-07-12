import { useEffect, useState } from "react";

export function useShortcutKey() {
  const [shortcutKey, setShortcutKey] = useState("Ctrl"); // Default to Ctrl for SSR

  useEffect(() => {
    // Only run on client side after hydration
    const isMacOs = !!navigator?.userAgent?.match(/Macintosh;/);
    setShortcutKey(isMacOs ? "⌘" : "Ctrl");
  }, []);

  return shortcutKey;
}
