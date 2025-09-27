'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Shield, Award, Star, CheckCircle } from 'lucide-react'
import Logo from './Logo'

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white">

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-gray-900 space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-primary text-white rounded-full px-4 py-2"
              >
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Licensed by IRA Kenya</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900"
              >
                Compare Insurance Quotes in Kenya
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl"
              >
                Licensed, Trusted, Quick – Get a Quote in Minutes
              </motion.p>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link 
                href="/quote" 
                className="btn-primary text-lg inline-flex items-center justify-center group"
              >
                Get Quote
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-wrap items-center gap-6 text-sm text-gray-600"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-secondary" />
                <span>Licensed by IRA</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-secondary" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-secondary" />
                <span>4.9/5 Rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Placeholder for image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-gray-100 rounded-lg p-8 h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">Insurance Illustration</p>
                <p className="text-sm">Placeholder for image</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
