'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { CheckCircle, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const ProductsList = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const products = [
    {
      category: 'Medical Insurance',
      title: 'Individual Medical Insurance',
      description: 'Comprehensive health coverage for individuals with access to quality healthcare facilities.',
      features: [
        'Inpatient & Outpatient Cover',
        'Maternity Benefits',
        'Dental & Optical Care',
        'Emergency Evacuation',
        'Pre-existing Conditions',
        'Annual Health Check-ups'
      ],
      benefits: [
        'Access to 100+ hospitals',
        'Cashless treatment',
        '24/7 emergency support',
        'Family discounts available'
      ],
      rating: 4.8,
      price: 'From KES 15,000/year'
    },
    {
      category: 'Medical Insurance',
      title: 'Family Medical Insurance',
      description: 'Complete health coverage for your entire family with comprehensive benefits.',
      features: [
        'Family Coverage (2-8 members)',
        'Maternity & Child Care',
        'Dental & Optical Benefits',
        'Emergency Services',
        'Preventive Care',
        'Mental Health Support'
      ],
      benefits: [
        'Family discounts up to 20%',
        'No age limit for children',
        'Maternity waiting period waived',
        'International coverage available'
      ],
      rating: 4.9,
      price: 'From KES 45,000/year'
    },
    {
      category: 'Life Insurance',
      title: 'Term Life Insurance',
      description: 'Affordable life insurance protection for a specific period with guaranteed benefits.',
      features: [
        'Coverage up to KES 10M',
        'Flexible premium payment',
        'Accidental death benefit',
        'Terminal illness benefit',
        'Waiver of premium',
        'Convertible to whole life'
      ],
      benefits: [
        'Lowest premium rates',
        'No medical examination',
        'Instant approval',
        'Tax benefits available'
      ],
      rating: 4.7,
      price: 'From KES 2,500/month'
    },
    {
      category: 'Life Insurance',
      title: 'Whole Life Insurance',
      description: 'Lifetime protection with cash value accumulation and investment benefits.',
      features: [
        'Lifetime coverage',
        'Cash value accumulation',
        'Dividend payments',
        'Policy loans available',
        'Estate planning benefits',
        'Flexible premium options'
      ],
      benefits: [
        'Guaranteed cash value',
        'Tax-deferred growth',
        'Estate tax benefits',
        'Living benefits available'
      ],
      rating: 4.6,
      price: 'From KES 5,000/month'
    },
    {
      category: 'Motor Insurance',
      title: 'Comprehensive Motor Insurance',
      description: 'Complete protection for your vehicle against all risks including theft and accidents.',
      features: [
        'All risks coverage',
        'Third party liability',
        'Theft protection',
        'Accident damage',
        'Fire & natural disasters',
        'Personal accident cover'
      ],
      benefits: [
        '24/7 roadside assistance',
        'Replacement vehicle',
        'No claim bonus',
        'Quick claims processing'
      ],
      rating: 4.8,
      price: 'From KES 25,000/year'
    },
    {
      category: 'Motor Insurance',
      title: 'Third Party Motor Insurance',
      description: 'Basic motor insurance coverage as required by law with affordable premiums.',
      features: [
        'Third party liability',
        'Property damage cover',
        'Bodily injury cover',
        'Legal liability',
        'Emergency assistance',
        'Valid across East Africa'
      ],
      benefits: [
        'Lowest premium rates',
        'Instant coverage',
        'No excess payment',
        'Quick renewal process'
      ],
      rating: 4.5,
      price: 'From KES 8,000/year'
    },
    {
      category: 'Travel Insurance',
      title: 'International Travel Insurance',
      description: 'Comprehensive travel protection for international trips with medical and trip coverage.',
      features: [
        'Medical emergency cover',
        'Trip cancellation',
        'Baggage loss/delay',
        'Personal liability',
        'Trip interruption',
        'Emergency evacuation'
      ],
      benefits: [
        'Worldwide coverage',
        '24/7 emergency support',
        'Quick claims settlement',
        'Family discounts available'
      ],
      rating: 4.7,
      price: 'From KES 2,500/trip'
    },
    {
      category: 'Home Insurance',
      title: 'Home & Contents Insurance',
      description: 'Protect your home and belongings against fire, theft, and natural disasters.',
      features: [
        'Building structure cover',
        'Contents insurance',
        'Fire & natural disasters',
        'Theft protection',
        'Liability coverage',
        'Alternative accommodation'
      ],
      benefits: [
        'Replacement value cover',
        'No depreciation',
        'Quick claims process',
        'Flexible coverage options'
      ],
      rating: 4.6,
      price: 'From KES 12,000/year'
    }
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
            Our Insurance <span className="text-primary">Products</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Detailed information about our comprehensive insurance products, 
            designed to meet your specific needs and budget.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-primary/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full mb-2">
                    {product.category}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.title}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-secondary fill-current" />
                  <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-6">{product.description}</p>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Features:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Benefits:</h4>
                <ul className="space-y-1">
                  {product.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Starting from</p>
                  <p className="text-lg font-semibold text-primary">{product.price}</p>
                </div>
                <Link 
                  href="/quote" 
                  className="btn-primary text-sm inline-flex items-center group"
                >
                  Get Quote
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-gray-600 mb-6">
              Don't see exactly what you need? We can create a custom insurance solution 
              tailored to your specific requirements and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote" className="btn-primary">
                Get Custom Quote
              </Link>
              <Link href="/contact" className="btn-outline">
                Speak to Advisor
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProductsList
