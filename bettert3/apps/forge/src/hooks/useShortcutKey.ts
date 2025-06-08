export function useShortcutKey() {
  const isMacOs = !!navigator?.userAgent?.match(/Macintosh;/);
  return isMacOs ? "⌘" : "Ctrl";
}
