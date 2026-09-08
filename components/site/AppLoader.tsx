'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

/**
 * Branded first-visit loader. Shown only while the page is still hydrating,
 * removed the moment the app is ready (never a forced animation), remembered
 * for the session so it does not replay on every navigation. Honours
 * prefers-reduced-motion. CSS only; no animation library.
 */
export function AppLoader() {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem('goldoak-loaded') === '1'
    } catch {
      seen = false
    }
    if (seen) return
    setVisible(true)
    const minimum = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650
    const start = Date.now()
    const done = () => {
      const wait = Math.max(0, minimum - (Date.now() - start))
      setTimeout(() => {
        setLeaving(true)
        setTimeout(() => setVisible(false), 350)
        try {
          sessionStorage.setItem('goldoak-loaded', '1')
        } catch {
          /* private mode */
        }
      }, wait)
    }
    if (document.readyState === 'complete') done()
    else window.addEventListener('load', done, { once: true })
    const safety = setTimeout(done, 2500)
    return () => {
      window.removeEventListener('load', done)
      clearTimeout(safety)
    }
  }, [])

  if (!visible) return null
  return (
    <div aria-hidden="true" className={`app-loader ${leaving ? 'app-loader--leaving' : ''}`}>
      <div className="app-loader__mark">
        <Image src="/assets/Gold Icon.png" alt="" width={72} height={72} priority className="app-loader__logo" />
        <span className="app-loader__ring" />
      </div>
      <p className="app-loader__word">GoldOak</p>
      <p className="app-loader__sub">Super Agent</p>
      <span className="app-loader__bar">
        <i />
      </span>
    </div>
  )
}
