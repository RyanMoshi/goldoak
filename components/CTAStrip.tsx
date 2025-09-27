'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Phone } from 'lucide-react'

const CTAStrip = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-secondary text-primary py-4"
    >
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-center">
          <p className="text-sm font-medium">
            Need help? Talk to an advisor on WhatsApp
          </p>
          <div className="flex space-x-3">
            <a
              href="https://wa.me/254729911311"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-secondary px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm inline-flex items-center group"
            >
              <MessageCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              WhatsApp
            </a>
            <a
              href="tel:+254729911311"
              className="border border-primary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary hover:text-secondary transition-colors text-sm inline-flex items-center group"
            >
              <Phone className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Call
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default CTAStrip
