'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

const Partners = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const partners = [
    { name: 'Jubilee Insurance', logo: '/api/placeholder/120/60' },
    { name: 'Britam Holdings', logo: '/api/placeholder/120/60' },
    { name: 'Old Mutual', logo: '/api/placeholder/120/60' },
    { name: 'CIC Insurance', logo: '/api/placeholder/120/60' },
    { name: 'AAR Insurance', logo: '/api/placeholder/120/60' },
    { name: 'GA Insurance', logo: '/api/placeholder/120/60' },
    { name: 'Heritage Insurance', logo: '/api/placeholder/120/60' },
    { name: 'Madison Insurance', logo: '/api/placeholder/120/60' },
    { name: 'APA Insurance', logo: '/api/placeholder/120/60' },
    { name: 'UAP Insurance', logo: '/api/placeholder/120/60' },
    { name: 'Sanlam Kenya', logo: '/api/placeholder/120/60' },
    { name: 'First Assurance', logo: '/api/placeholder/120/60' }
  ]

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
            Our Trusted <span className="text-primary">Insurance Partners</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We work with Kenya's leading insurance companies to provide you with the best coverage options 
            and competitive rates.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 flex items-center justify-center group hover:border-primary/20 border border-gray-100"
            >
              <div className="text-center">
                <div className="w-20 h-10 bg-gray-200 rounded flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-primary">
                    {partner.name.split(' ')[0]}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">{partner.name}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-6">
            Don't see your preferred insurer? We can work with any licensed insurance company in Kenya.
          </p>
          <a href="/partners" className="btn-outline">
            View All Partners
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default Partners
