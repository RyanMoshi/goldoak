'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Logo from './Logo'

const BrandShowcase = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Our <span className="brand-text-gradient">Brand Identity</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional, trustworthy, and reliable - our brand reflects our commitment 
            to excellence in insurance services.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Logo Variants */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Logo Variants</h3>
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Gold Variant</h4>
                  <Logo variant="gold" size="lg" showText={true} />
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Green Variant</h4>
                  <Logo variant="green" size="lg" showText={true} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Brand Colors */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Brand Colors</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Primary Navy</h4>
                      <p className="text-gray-600">#004B87</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Deep navy blue representing trust, stability, and professionalism.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">G</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Secondary Gold</h4>
                      <p className="text-gray-600">#C19A6B</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Warm gold representing premium quality, excellence, and value.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 brand-gradient rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">G</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Brand Gradient</h4>
                      <p className="text-gray-600">Navy to Gold</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Dynamic gradient combining both brand colors for modern appeal.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="brand-gradient rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Professional & Trustworthy</h3>
            <p className="text-white/90 mb-6 max-w-3xl mx-auto">
              Our brand identity reflects our commitment to providing reliable, 
              professional insurance services that you can trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/about" className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Learn More About Us
              </a>
              <a href="/contact" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
                Get in Touch
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default BrandShowcase
