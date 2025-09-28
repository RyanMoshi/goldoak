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

          {/* Right Side - Insurance Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Professional Insurance and Financial Planning"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-primary/30 rounded-lg"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="text-lg font-bold text-primary mb-2">Secure Your Future</h3>
                  <p className="text-sm text-gray-700">Professional insurance coverage for all your needs</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
