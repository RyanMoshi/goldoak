'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, MessageCircle, ChevronDown } from 'lucide-react'
import Logo from './Logo'
import QuoteModal from './QuoteModal'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '#hero' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Process', href: '#process' },
    { name: 'Claims', href: '#claims' },
    { name: 'Why Choose Us', href: '#why-choose-us' },
    { name: 'Contact', href: '#contact' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
      setIsOpen(false)
    }
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-primary shadow-lg' 
        : 'bg-primary'
    }`}>
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo variant="gold" size="lg" showText={false} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="font-medium text-white hover:text-secondary transition-colors duration-200"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Contact Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <a
              href="tel:+254729911311"
              className="flex items-center space-x-2 text-white hover:text-secondary transition-colors group"
            >
              <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">+254 729 911 311</span>
            </a>
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="bg-secondary text-primary px-6 py-2 rounded-lg font-semibold hover:bg-secondary/90 transition-colors text-sm inline-flex items-center group"
            >
              <span>Get a Quote</span>
              <ChevronDown className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform" />
            </button>
            <a
              href="https://wa.me/254729911311"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm inline-flex items-center group"
            >
              <MessageCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              WhatsApp
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 rounded-xl text-white hover:text-secondary hover:bg-white/10 transition-all duration-300"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-white/20 py-6 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="block py-3 px-4 rounded-xl font-medium transition-all duration-200 text-white hover:text-secondary hover:bg-white/5 w-full text-left"
              >
                {item.name}
              </button>
            ))}
            
            <div className="pt-4 border-t border-white/20 space-y-4">
              <a
                href="tel:+254729911311"
                className="flex items-center space-x-3 py-3 px-4 text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span className="font-medium">+254 729 911 311</span>
              </a>
              
              <button
                onClick={() => {
                  setIsQuoteModalOpen(true)
                  setIsOpen(false)
                }}
                className="bg-secondary text-primary w-full text-center justify-center py-3 px-4 rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
              >
                Get a Quote
              </button>
              
              <a
                href="https://wa.me/254729911311"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-primary w-full text-center justify-center py-3 px-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quote Modal */}
      <QuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
      />
    </nav>
  )
}

export default Navigation
