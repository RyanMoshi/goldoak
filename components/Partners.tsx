'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Shield, Award, CheckCircle } from 'lucide-react'

const Partners = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const partners = [
    { name: 'Jubilee Insurance', logo: '/assets/logos/jubilee.png', website: 'https://jubileeinsurance.com', established: '1937' },
    { name: 'Britam Holdings', logo: '/assets/logos/britam.png', website: 'https://britam.com', established: '1967' },
    { name: 'Old Mutual', logo: '/assets/logos/old-mutual.png', website: 'https://oldmutual.co.ke', established: '1845' },
    { name: 'CIC Insurance', logo: '/assets/logos/cic.png', website: 'https://cic.co.ke', established: '1978' },
    { name: 'AAR Insurance', logo: '/assets/logos/aar.png', website: 'https://aar.co.ke', established: '1984' },
    { name: 'GA Insurance', logo: '/assets/logos/ga.png', website: 'https://gainsurance.com', established: '1987' },
    { name: 'Heritage Insurance', logo: '/assets/logos/heritage.png', website: 'https://heritage.co.ke', established: '1994' },
    { name: 'Madison Insurance', logo: '/assets/logos/madison.png', website: 'https://madison.co.ke', established: '1996' },
    { name: 'APA Insurance', logo: '/assets/logos/apa.png', website: 'https://apainsurance.com', established: '1998' },
    { name: 'UAP Insurance', logo: '/assets/logos/uap.png', website: 'https://uap.co.ke', established: '1937' },
    { name: 'Sanlam Kenya', logo: '/assets/logos/sanlam.png', website: 'https://sanlam.co.ke', established: '1918' },
    { name: 'First Assurance', logo: '/assets/logos/first-assurance.png', website: 'https://firstassurance.co.ke', established: '2000' }
  ]

  return (
    <section ref={ref} className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-6 py-3 mb-6">
            <Award className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Licensed Partners</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Our Trusted <span className="text-gradient">Insurance Partners</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We work with Kenya's leading insurance companies to provide you with the best coverage options, 
            competitive rates, and exceptional service. All our partners are licensed by the Insurance Regulatory Authority.
          </p>
        </motion.div>

        {/* Premium Partners Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block card-premium-hover p-8 text-center h-full"
              >
                <div className="space-y-4">
                  {/* Logo Container */}
                  <div className="w-24 h-16 mx-auto bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-primary/5 transition-colors duration-300">
                    <Image
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      width={80}
                      height={40}
                      className="object-contain max-w-full max-h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="hidden items-center justify-center w-full h-full text-center"
                      style={{ display: 'none' }}
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Partner Info */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {partner.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Since {partner.established}
                    </p>
                  </div>
                  
                  {/* Verified Badge */}
                  <div className="flex items-center justify-center space-x-1 text-xs text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">IRA Licensed</span>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-center text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">12+</div>
              <div className="text-lg opacity-90">Insurance Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">Years Combined Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-lg opacity-90">IRA Licensed</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="text-center mt-16"
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Don't see your preferred insurer?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              We can work with any licensed insurance company in Kenya. 
              Our team will help you find the perfect coverage from any provider.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/partners" className="btn-primary">
                View All Partners
              </Link>
              <Link href="/contact" className="btn-outline">
                Request Custom Quote
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Partners
