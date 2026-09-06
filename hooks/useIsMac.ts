'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const getSnapshot = () => /Mac|iPhone|iPad/.test(navigator.platform)
const getServerSnapshot = () => false

/** True on Apple platforms; false on the server. Hydration-safe. */
export function useIsMac(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
