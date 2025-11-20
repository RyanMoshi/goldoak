'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Shield, Target, Heart, Users, Award, CheckCircle, ChevronDown } from 'lucide-react'

const AboutSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [showDetails, setShowDetails] = useState(false)

  return (
    <section id="about" ref={ref} className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Company Profile */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            About GoldOak
          </h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Licensed insurance intermediary in Kenya, regulated by IRA. Partnering with top providers for reliable solutions.
            </p>
            <div className="inline-flex items-center space-x-2 bg-primary text-white rounded-full px-3 py-1.5 text-xs sm:text-sm">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-semibold">Licensed by IRA Kenya</span>
            </div>
          </div>
        </motion.div>

        {/* Vision, Mission, Values - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Vision, Mission & Values</h3>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showDetails ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Vision</h4>
                  <p className="text-xs text-gray-600">Kenya's most trusted insurance partner.</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Mission</h4>
                  <p className="text-xs text-gray-600">Connect clients with best insurance products.</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Values</h4>
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
