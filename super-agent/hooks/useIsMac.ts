"use client";

import { useSyncExternalStore } from "react";

function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): boolean {
  return /Mac|iPhone|iPad/.test(navigator.platform);
}

function getServerSnapshot(): boolean {
  return false;
}

/** True on Apple platforms, false on the server and everywhere else. Hydration-safe. */
export function useIsMac(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
