'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { 
  FileCheck, 
  Users, 
  Clock, 
  CheckCircle, 
  Shield, 
  Phone,
  ArrowRight,
  Heart,
  ChevronDown
} from 'lucide-react'

const ClaimsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [showSupport, setShowSupport] = useState(false)

  const claimsProcess = [
    {
      icon: FileCheck,
      title: 'Documentation',
      description: 'Help gather all necessary documentation.',
      details: ['Claim forms', 'Document collection', 'Evidence prep', 'Medical reports']
    },
    {
      icon: Users,
      title: 'Underwriter Engagement',
      description: 'Liaise with underwriters on your behalf.',
      details: ['Direct communication', 'Assessor coordination', 'Negotiations', 'Technical discussions']
    },
    {
      icon: Clock,
      title: 'Regular Updates',
      description: 'Receive regular status updates.',
      details: ['Weekly updates', 'Progress tracking', 'Timeline management', 'Transparent communication']
    },
    {
      icon: CheckCircle,
      title: 'Compensation',
      description: 'Follow through until full disbursement.',
      details: ['Payment tracking', 'Disbursement coordination', 'Settlement confirmation', 'Post-claim support']
    }
  ]

  const supportFeatures = [
    {
      icon: Shield,
      title: 'Expert Handling',
      description: 'Experienced team knows claims inside and out.'
    },
    {
      icon: Phone,
      title: '24/7 Support',
      description: 'Round-the-clock support during claims.'
    },
    {
      icon: Heart,
      title: 'Personal Touch',
      description: 'Every claim receives personal attention.'
    }
  ]

  return (
    <section id="claims" ref={ref} className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Claims Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-4">
            We support you every step to ensure you get the compensation you deserve.
          </p>
          <div className="bg-primary rounded-xl p-4 sm:p-6 text-white max-w-3xl mx-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-2">"We Stay With You From Policy to Payout"</h3>
            <p className="text-xs sm:text-sm opacity-90">
              Our commitment doesn't end at purchase. We're with you throughout your journey.
            </p>
          </div>
        </motion.div>

        {/* Claims Process */}
        <div className="mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6">Our Claims Process</h3>
          <div className="space-y-3">
            {claimsProcess.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100"
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === step.title ? null : step.title)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-gray-900">{step.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                      expandedStep === step.title ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedStep === step.title && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-secondary flex-shrink-0" />
                        <span className="text-xs text-gray-600">{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Support Features - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-8 sm:mb-12"
        >
          <button
            onClick={() => setShowSupport(!showSupport)}
            className="w-full flex items-center justify-between text-left mb-4"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Why Our Claims Support Stands Out</h3>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showSupport ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showSupport && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {supportFeatures.map((feature, index) => (
                <div key={feature.title} className="text-center">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <feature.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-primary rounded-xl p-4 sm:p-6 text-white">
            <h3 className="text-lg sm:text-xl font-bold mb-2">Need to File a Claim?</h3>
            <p className="text-xs sm:text-sm mb-4 opacity-90">
              Don't navigate alone. Our experts are ready to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+254729911311"
                className="bg-secondary text-primary px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-secondary/90 transition-colors inline-flex items-center justify-center"
              >
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Call: +254 729 911 311
              </a>
              <button 
                onClick={() => {
                  const element = document.querySelector('#contact')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="bg-white text-primary px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Online
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ClaimsSection
