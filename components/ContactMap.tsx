'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactMap() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

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
            Find Us on the <span className="text-primary">Map</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Visit our office in Nairobi for in-person consultations and personalized service.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Google Maps Integration</h3>
                <p className="text-gray-600 mb-4">
                  Interactive map showing our office location in Nairobi
                </p>
                <a
                  href="https://maps.google.com/?q=Nairobi,Kenya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-primary/5 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-primary mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Office Address</h3>
              </div>
              <p className="text-gray-700">
                Goldoak Insurance Agency Limited<br />
                Nairobi, Kenya<br />
                East Africa
              </p>
            </div>

            <div className="bg-secondary/5 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Phone className="w-6 h-6 text-secondary mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Phone Numbers</h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Main:</strong> +254 729 911 311
                </p>
                <p className="text-gray-700">
                  <strong>WhatsApp:</strong> +254 729 911 311
                </p>
                <p className="text-gray-700">
                  <strong>Emergency:</strong> +254 729 911 311
                </p>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-primary mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Email Addresses</h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>General:</strong> info@goldoak.co.ke
                </p>
                <p className="text-gray-700">
                  <strong>Quotes:</strong> quotes@goldoak.co.ke
                </p>
                <p className="text-gray-700">
                  <strong>Support:</strong> support@goldoak.co.ke
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-gray-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Mon - Fri:</strong> 8:00 AM - 6:00 PM</p>
                <p><strong>Saturday:</strong> 9:00 AM - 4:00 PM</p>
                <p><strong>Sunday:</strong> Closed</p>
                <p><strong>Emergency:</strong> 24/7</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Don't wait for the unexpected. Contact us today and let us help you find 
              the perfect insurance coverage for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/quote" className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Free Quote
              </a>
              <a href="tel:+254729911311" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
                Call Now
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}