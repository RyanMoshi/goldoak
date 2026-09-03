'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, ChevronDown, ArrowRight } from 'lucide-react'
import Logo from './Logo'
import { mainNav } from '@/lib/navigation'
import { contact } from '@/lib/contact'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
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
    setOpenDropdown(null)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-primary/95 backdrop-blur-md shadow-lg'
          : 'bg-primary'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex-shrink-0" aria-label="GoldOak - Home">
            <Logo variant="gold" size="lg" logoType="sidename" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {mainNav.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-white bg-white/10'
                      : 'text-gray-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                  {item.children && (
                    <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                  )}
                </Link>

                {item.children && openDropdown === item.name && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[220px]">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:text-primary hover:bg-navy-50 transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center space-x-3">
            <a
              href={`tel:${contact.phoneRaw}`}
              className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>{contact.phone}</span>
            </a>
            <Link
              href="/contact"
              className="bg-secondary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gold-500 transition-all duration-300 text-sm inline-flex items-center gap-2 group"
            >
              Start a Risk Review
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 rounded-xl text-white hover:text-secondary hover:bg-white/10 transition-all duration-300"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
          }`}
          role="menu"
        >
          <div className="border-t border-white/20 py-6 space-y-1">
            {mainNav.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`block py-3 px-4 rounded-xl font-medium transition-all duration-200 text-white hover:text-secondary hover:bg-white/5 ${
                    isActive(item.href) ? 'bg-white/10 text-secondary' : ''
                  }`}
                  role="menuitem"
                >
                  {item.name}
                </Link>
                {item.children && (
                  <div className="pl-6 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block py-2 px-4 rounded-lg text-sm text-gray-300 hover:text-secondary hover:bg-white/5 transition-colors"
                        role="menuitem"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-white/20 space-y-3">
              <a
                href={`tel:${contact.phoneRaw}`}
                className="flex items-center gap-3 py-3 px-4 text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span className="font-medium">{contact.phone}</span>
              </a>
              <Link
                href="/contact"
                className="bg-secondary text-white w-full text-center justify-center py-3 px-4 rounded-xl font-semibold hover:bg-gold-500 transition-colors inline-flex items-center gap-2"
              >
                Start a Risk Review
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
