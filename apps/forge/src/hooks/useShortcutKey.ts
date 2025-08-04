import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';
import { useState } from 'react';

const getUserAgent = createIsomorphicFn()
  .client(() => navigator.userAgent)
  .server(() => getRequestHeader("user-agent"))

export function useShortcutKey() {
  const [userAgent] = useState(getUserAgent);

  return userAgent?.match(/Macintosh;/) ? "⌘" : "Ctrl";
}