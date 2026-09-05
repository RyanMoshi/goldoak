"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "super-agent.recent-commands";
const LIMIT = 5;
const EMPTY: string[] = [];

/*
 * A tiny external store over localStorage so React can subscribe to it
 * without effects. Server snapshot is always empty; the client snapshot is
 * cached by raw value so its identity is stable between reads.
 */
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: string[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): string[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function write(commands: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(commands));
  } catch {
    // Storage unavailable (private mode, quota). Recents are a convenience only.
  }
  listeners.forEach((listener) => listener());
}

/** Per-device list of recently run commands. Contains only what the agent typed. */
export function useRecentCommands() {
  const recent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const remember = useCallback((command: string) => {
    const current = getSnapshot();
    write([command, ...current.filter((c) => c !== command)].slice(0, LIMIT));
  }, []);

  const clear = useCallback(() => {
    write([]);
  }, []);

  return { recent, remember, clear };
}
