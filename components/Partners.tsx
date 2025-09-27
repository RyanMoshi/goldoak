'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Partners = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const partners = [
    { name: 'Jubilee Insurance', logo: '/assets/logos/jubilee.png', website: 'https://jubileeinsurance.com' },
    { name: 'Britam Holdings', logo: '/assets/logos/britam.png', website: 'https://britam.com' },
    { name: 'Old Mutual', logo: '/assets/logos/old-mutual.png', website: 'https://oldmutual.co.ke' },
    { name: 'CIC Insurance', logo: '/assets/logos/cic.png', website: 'https://cic.co.ke' },
    { name: 'AAR Insurance', logo: '/assets/logos/aar.png', website: 'https://aar.co.ke' },
    { name: 'GA Insurance', logo: '/assets/logos/ga.png', website: 'https://gainsurance.com' },
    { name: 'Heritage Insurance', logo: '/assets/logos/heritage.png', website: 'https://heritage.co.ke' },
    { name: 'Madison Insurance', logo: '/assets/logos/madison.png', website: 'https://madison.co.ke' },
    { name: 'APA Insurance', logo: '/assets/logos/apa.png', website: 'https://apainsurance.com' },
    { name: 'UAP Insurance', logo: '/assets/logos/uap.png', website: 'https://uap.co.ke' },
    { name: 'Sanlam Kenya', logo: '/assets/logos/sanlam.png', website: 'https://sanlam.co.ke' },
    { name: 'First Assurance', logo: '/assets/logos/first-assurance.png', website: 'https://firstassurance.co.ke' }
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
            <motion.a
              key={partner.name}
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 flex items-center justify-center group hover:border-primary/20 border border-gray-100"
            >
              <div className="text-center">
                <div className="w-20 h-10 bg-gray-100 rounded flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    width={80}
                    height={32}
                    className="object-contain max-w-full max-h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <span 
                    className="text-xs font-semibold text-gray-600 group-hover:text-primary hidden"
                    style={{ display: 'none' }}
                  >
                    {partner.name.split(' ')[0]}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">{partner.name}</p>
              </div>
            </motion.a>
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
