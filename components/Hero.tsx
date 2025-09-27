'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Shield, Users, Clock, CheckCircle, Star, Award, Zap, TrendingUp } from 'lucide-react'

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-accent to-secondary">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-sm"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-secondary rounded-full blur-sm"></div>
        <div className="absolute bottom-32 left-1/3 w-16 h-16 bg-white rounded-full blur-sm"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-secondary rounded-full blur-sm"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20"
              >
                <Award className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Licensed by IRA Kenya</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                Get the Best Insurance Quotes in Kenya
                <span className="block text-secondary mt-2">– Instantly</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl md:text-2xl text-gray-100 leading-relaxed max-w-2xl"
              >
                Compare quotes from Kenya's top insurance companies in minutes. 
                Save up to 40% on your insurance premiums with our free service.
              </motion.p>
            </div>

            {/* Quick Quote Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Get Your Quote in 30 Seconds</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="px-4 py-3 rounded-xl border-0 text-gray-900 focus:ring-2 focus:ring-secondary focus:outline-none">
                  <option>Type of Insurance</option>
                  <option>Motor Insurance</option>
                  <option>Medical Insurance</option>
                  <option>Life Insurance</option>
                  <option>Home Insurance</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Car Model (if Motor)" 
                  className="px-4 py-3 rounded-xl border-0 text-gray-900 focus:ring-2 focus:ring-secondary focus:outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Your Location" 
                  className="px-4 py-3 rounded-xl border-0 text-gray-900 focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>
              <Link href="/quote" className="btn-secondary w-full text-center justify-center mt-4 inline-flex items-center group">
                Get Quote
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              <div className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Instant Quotes</p>
                  <p className="text-xs text-gray-300">Compare in minutes</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Save Up to 40%</p>
                  <p className="text-xs text-gray-300">Best rates guaranteed</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">100% Free</p>
                  <p className="text-xs text-gray-300">No hidden fees</p>
                </div>
              </div>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex items-center space-x-6"
            >
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-secondary fill-current" />
                ))}
                <span className="text-sm text-gray-200 ml-2">4.9/5 Rating</span>
              </div>
              <div className="text-sm text-gray-300">
                <span className="font-semibold text-white">5,000+</span> Happy Customers
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-2">Why Choose Goldoak?</h3>
                  <p className="text-gray-600">Kenya's most trusted insurance comparison platform</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { icon: Clock, text: 'Get quotes in under 2 minutes', color: 'text-blue-500' },
                    { icon: Users, text: 'Compare 12+ top insurers', color: 'text-green-500' },
                    { icon: Shield, text: 'Licensed by IRA Kenya', color: 'text-purple-500' },
                    { icon: CheckCircle, text: '100% free, no obligation', color: 'text-orange-500' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                      <span className="text-gray-700 font-medium">{item.text}</span>
                    </motion.div>
                  ))}
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
