'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, CheckCircle, ArrowRight, Phone, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const ProductCTA = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const features = [
    'Compare quotes from multiple insurers',
    'Get the best rates and coverage',
    'Expert advice and guidance',
    'Quick and easy application process',
    '24/7 customer support',
    'No obligation to purchase'
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
            Ready to Get <span className="text-primary">Protected?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't wait for the unexpected. Get comprehensive insurance coverage today 
            and secure your future with Kenya's trusted insurance partners.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-primary/5 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mr-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Why Choose Us?</h3>
                  <p className="text-gray-600">Your trusted insurance partner</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Get Your Quote Today
              </h3>
              <p className="text-gray-600 mb-8">
                Fill out our simple form and get quotes from multiple insurance companies 
                in minutes. No obligation, completely free.
              </p>
            </div>

            <div className="space-y-4">
              <Link 
                href="/quote" 
                className="w-full btn-primary text-center inline-flex items-center justify-center group"
              >
                Start Your Application
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="text-center text-gray-500 text-sm">
                or
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="tel:+254729911311"
                  className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Us</span>
                </a>
                <a
                  href="https://wa.me/254729911311"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 bg-green-100 text-green-700 px-6 py-3 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Quick Facts:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Average Response Time:</span>
                  <span className="font-semibold text-gray-900 ml-2">2 hours</span>
                </div>
                <div>
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-semibold text-gray-900 ml-2">99%</span>
                </div>
                <div>
                  <span className="text-gray-600">Client Satisfaction:</span>
                  <span className="font-semibold text-gray-900 ml-2">4.8/5</span>
                </div>
                <div>
                  <span className="text-gray-600">Years Experience:</span>
                  <span className="font-semibold text-gray-900 ml-2">8+</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ProductCTA
