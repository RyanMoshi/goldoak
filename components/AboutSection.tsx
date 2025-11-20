'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Shield, Target, Heart, CheckCircle, ChevronDown } from 'lucide-react'

const AboutSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [showDetails, setShowDetails] = useState(false)

  return (
    <section id="about" ref={ref} className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            About GoldOak
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">
            Licensed insurance intermediary in Kenya, regulated by IRA. Partnering with top providers for reliable solutions.
          </p>
          <div className="inline-flex items-center space-x-2 bg-primary text-white rounded-full px-3 py-1 text-xs">
            <CheckCircle className="w-3 h-3" />
            <span className="font-semibold">Licensed by IRA Kenya</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Vision, Mission & Values</h3>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform ${
                showDetails ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div>
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 mb-1">Vision</h4>
                  <p className="text-xs text-gray-600">Kenya's most trusted insurance partner.</p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-4 h-4 text-secondary" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 mb-1">Mission</h4>
                  <p className="text-xs text-gray-600">Connect clients with best insurance products.</p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 mb-1">Values</h4>
                  <p className="text-xs text-gray-600">Integrity, Customer Focus, Value, Solutions.</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection
