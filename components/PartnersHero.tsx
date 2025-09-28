'use client'

import { motion } from 'framer-motion'
import { Shield, Users, Award, Star } from 'lucide-react'

const PartnersHero = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Our Trusted <span className="text-secondary">Insurance Partners</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            We work with Kenya's leading insurance companies to provide you with the best 
            coverage options and competitive rates.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <Shield className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">15+ Partners</h3>
              <p className="text-sm text-white/80">Leading Insurers</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">10,000+ Clients</h3>
              <p className="text-sm text-white/80">Served</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center"
            >
              <Award className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Best Rates</h3>
              <p className="text-sm text-white/80">Competitive Pricing</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <Star className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">99% Satisfaction</h3>
              <p className="text-sm text-white/80">Client Rating</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PartnersHero
