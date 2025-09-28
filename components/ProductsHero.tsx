'use client'

import { motion } from 'framer-motion'
import { Shield, Heart, Car, Home, Plane, GraduationCap, Building2, Users } from 'lucide-react'

const ProductsHero = () => {
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
            Comprehensive <span className="text-secondary">Insurance Products</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            From medical to motor, life to travel - we offer complete insurance 
            solutions for all your protection needs.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <Heart className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium">Medical</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium">Life</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <Car className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium">Motor</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <Home className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium">Home</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center"
            >
              <Plane className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium">Travel</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center"
            >
              <GraduationCap className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium">Education</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-center"
            >
              <Building2 className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium">Corporate</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium">Micro</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProductsHero
