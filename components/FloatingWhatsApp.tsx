'use client'

import { MessageCircle } from 'lucide-react'

const FloatingWhatsApp = () => {
  return (
    <a
      href="https://wa.me/254729911311"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-secondary text-primary p-4 rounded-full shadow-lg hover:bg-secondary/90 transition-colors duration-200 hover:scale-110"
      aria-label="WhatsApp Support"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  )
}

export default FloatingWhatsApp
