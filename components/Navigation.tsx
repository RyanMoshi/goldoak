'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, ArrowRight, Sparkles } from 'lucide-react'
import Logo from './Logo'
import { mainNav } from '@/lib/navigation'
import { contact } from '@/lib/contact'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 flex justify-center" ref={menuRef}>
      {/* Floating Pill Header */}
      <div
        className={`flex items-center justify-between w-full max-w-5xl rounded-full px-4 py-2.5 transition-all duration-300 ${
          isScrolled
            ? 'bg-forest/80 backdrop-blur-xl shadow-lg shadow-forest/20'
            : 'bg-forest/60 backdrop-blur-md'
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex-shrink-0" aria-label="GoldOak - Home">
          <Logo variant="gold" size="sm" logoType="icon" />
        </Link>

        {/* Right side: CTA + Hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center gap-1.5 bg-gold text-forest px-4 py-2 rounded-full text-[13px] font-bold hover:bg-gold-500 transition-colors"
          >
            Start a Risk Review
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 w-full max-w-5xl mt-2 rounded-2xl bg-forest/95 backdrop-blur-xl shadow-xl shadow-forest/30 border border-white/10 transition-all duration-300 origin-top ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="p-6">
          {/* Nav Links */}
          <div className="space-y-1">
            {mainNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-white/10 text-gold'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-white/10" />

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/super-agent"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-secondary hover:bg-white/10 transition-colors font-semibold text-[15px]"
            >
              <Sparkles className="w-4 h-4" />
              Super Agent
            </Link>
            <a
              href={`tel:${contact.phoneRaw}`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-medium text-[15px]"
            >
              <Phone className="w-4 h-4" />
              {contact.phone}
            </a>
            <Link
              href="/contact"
              className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold text-forest font-bold text-[15px] hover:bg-gold-500 transition-colors"
            >
              Start a Risk Review
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navigation
