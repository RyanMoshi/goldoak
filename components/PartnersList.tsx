'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star, CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const PartnersList = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const partners = [
    {
      name: 'Jubilee Insurance',
      logo: '/api/placeholder/120/60',
      description: 'Leading general insurance company with comprehensive coverage options.',
      rating: 4.8,
      products: ['Medical', 'Motor', 'Property', 'Travel'],
      strengths: ['Strong Claims Processing', 'Wide Network', 'Digital Services'],
      website: 'https://jubileeinsurance.com'
    },
    {
      name: 'Britam Holdings',
      logo: '/api/placeholder/120/60',
      description: 'Diversified financial services group offering life and general insurance.',
      rating: 4.7,
      products: ['Life Insurance', 'Medical', 'Investment', 'Pension'],
      strengths: ['Investment Options', 'Life Insurance', 'Pension Plans'],
      website: 'https://britam.com'
    },
    {
      name: 'Old Mutual',
      logo: '/api/placeholder/120/60',
      description: 'International insurance company with strong local presence.',
      rating: 4.6,
      products: ['Life Insurance', 'Medical', 'Investment', 'Savings'],
      strengths: ['International Backing', 'Life Insurance', 'Investment Products'],
      website: 'https://oldmutual.co.ke'
    },
    {
      name: 'CIC Insurance',
      logo: '/api/placeholder/120/60',
      description: 'Cooperative insurance company with focus on agricultural and general insurance.',
      rating: 4.5,
      products: ['Agricultural', 'Medical', 'Motor', 'Property'],
      strengths: ['Agricultural Focus', 'Cooperative Model', 'Rural Coverage'],
      website: 'https://cic.co.ke'
    },
    {
      name: 'AAR Insurance',
      logo: '/api/placeholder/120/60',
      description: 'Healthcare-focused insurance company with extensive medical network.',
      rating: 4.8,
      products: ['Medical Insurance', 'Travel', 'Motor', 'Property'],
      strengths: ['Healthcare Focus', 'Medical Network', 'Claims Processing'],
      website: 'https://aar.co.ke'
    },
    {
      name: 'GA Insurance',
      logo: '/api/placeholder/120/60',
      description: 'General insurance company with comprehensive coverage options.',
      rating: 4.4,
      products: ['Motor', 'Property', 'Medical', 'Travel'],
      strengths: ['General Insurance', 'Competitive Rates', 'Local Focus'],
      website: 'https://gainsurance.com'
    },
    {
      name: 'Heritage Insurance',
      logo: '/api/placeholder/120/60',
      description: 'Growing insurance company with innovative products and services.',
      rating: 4.3,
      products: ['Motor', 'Property', 'Medical', 'Life'],
      strengths: ['Innovation', 'Customer Service', 'Digital Platform'],
      website: 'https://heritage.co.ke'
    },
    {
      name: 'Madison Insurance',
      logo: '/api/placeholder/120/60',
      description: 'Established insurance company with strong market presence.',
      rating: 4.5,
      products: ['General Insurance', 'Medical', 'Motor', 'Property'],
      strengths: ['Market Experience', 'Stable Operations', 'Claims Service'],
      website: 'https://madison.co.ke'
    },
    {
      name: 'APA Insurance',
      logo: '/api/placeholder/120/60',
      description: 'Pan-African insurance company with regional expertise.',
      rating: 4.6,
      products: ['General Insurance', 'Life', 'Medical', 'Travel'],
      strengths: ['Pan-African Network', 'Regional Expertise', 'Diverse Products'],
      website: 'https://apainsurance.com'
    },
    {
      name: 'UAP Insurance',
      logo: '/api/placeholder/120/60',
      description: 'Leading insurance company with comprehensive product portfolio.',
      rating: 4.7,
      products: ['Life Insurance', 'General', 'Medical', 'Investment'],
      strengths: ['Product Range', 'Financial Strength', 'Market Leadership'],
      website: 'https://uap.co.ke'
    },
    {
      name: 'Sanlam Kenya',
      logo: '/api/placeholder/120/60',
      description: 'International insurance company with local expertise.',
      rating: 4.5,
      products: ['Life Insurance', 'Investment', 'Pension', 'Medical'],
      strengths: ['International Backing', 'Life Insurance', 'Investment Focus'],
      website: 'https://sanlam.co.ke'
    },
    {
      name: 'First Assurance',
      logo: '/api/placeholder/120/60',
      description: 'Growing insurance company with focus on customer service.',
      rating: 4.4,
      products: ['General Insurance', 'Motor', 'Property', 'Medical'],
      strengths: ['Customer Service', 'Competitive Pricing', 'Local Focus'],
      website: 'https://firstassurance.co.ke'
    }
  ]

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Our Insurance <span className="text-primary">Partners</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We work with Kenya's leading insurance companies to provide you with 
            comprehensive coverage options and competitive rates.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-primary/20 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-20 h-10 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">
                    {partner.name.split(' ')[0]}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-secondary fill-current" />
                  <span className="text-sm font-semibold text-gray-700">{partner.rating}</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">{partner.name}</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{partner.description}</p>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Products:</h4>
                <div className="flex flex-wrap gap-2">
                  {partner.products.map((product, productIndex) => (
                    <span
                      key={productIndex}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Strengths:</h4>
                <ul className="space-y-1">
                  {partner.strengths.map((strength, strengthIndex) => (
                    <li key={strengthIndex} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-3">
                <Link
                  href="/quote"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors text-center"
                >
                  Get Quote
                </Link>
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-16"
        >
          <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Don't See Your Preferred Insurer?
            </h3>
            <p className="text-gray-600 mb-6">
              We can work with any licensed insurance company in Kenya. Contact us to 
              discuss your specific insurance needs and we'll find the right partner for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary">
                Contact Us
              </Link>
              <Link href="/quote" className="btn-outline">
                Get Quote
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PartnersList
