'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle, Clock, Users } from 'lucide-react'

const QuoteHero = () => {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Get Your <span className="text-secondary">Insurance Quote</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Compare quotes from multiple insurers and find the best coverage 
            for your needs. It's free, fast, and completely confidential.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <Shield className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Free Quote</h3>
              <p className="text-sm text-white/80">No cost, no obligation</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <Clock className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quick Process</h3>
              <p className="text-sm text-white/80">5 minutes to complete</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center"
            >
              <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multiple Quotes</h3>
              <p className="text-sm text-white/80">Compare 15+ insurers</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <CheckCircle className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Best Rates</h3>
              <p className="text-sm text-white/80">Competitive pricing</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default QuoteHero
