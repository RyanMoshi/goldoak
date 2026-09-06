'use client'

import { useEffect } from 'react'

interface ShortcutOptions {
  key: string
  meta?: boolean
  enabled?: boolean
}

/** Registers a document-level keyboard shortcut. */
export function useKeyboardShortcut({ key, meta = false, enabled = true }: ShortcutOptions, handler: (event: KeyboardEvent) => void) {
  useEffect(() => {
    if (!enabled) return
    function onKeyDown(event: KeyboardEvent) {
      const metaMatches = meta ? event.metaKey || event.ctrlKey : true
      if (metaMatches && event.key.toLowerCase() === key.toLowerCase()) handler(event)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [key, meta, enabled, handler])
}
