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

  const claimsProcess = [
    {
      icon: FileCheck,
      title: 'Documentation & Evidence',
      description: 'We help gather and organize all necessary documentation for your claim.',
      details: [
        'Claim form completion',
        'Document collection',
        'Evidence preparation',
        'Medical reports coordination'
      ]
    },
    {
      icon: Users,
      title: 'Underwriter Engagement',
      description: 'We liaise directly with underwriters and claims assessors on your behalf.',
      details: [
        'Direct communication with insurers',
        'Claims assessor coordination',
        'Underwriter negotiations',
        'Technical discussions'
      ]
    },
    {
      icon: Clock,
      title: 'Regular Updates',
      description: 'You receive regular updates on your claim status and progress.',
      details: [
        'Weekly status updates',
        'Progress tracking',
        'Timeline management',
        'Transparent communication'
      ]
    },
    {
      icon: CheckCircle,
      title: 'Compensation Disbursement',
      description: 'We follow through until your compensation is fully disbursed.',
      details: [
        'Payment tracking',
        'Disbursement coordination',
        'Settlement confirmation',
        'Post-claim support'
      ]
    }
  ]

  const supportFeatures = [
    {
      icon: Shield,
      title: 'Expert Handling',
      description: 'Experienced team knows insurance claims inside and out.'
    },
    {
      icon: Phone,
      title: '24/7 Support',
      description: 'Round-the-clock support during claims processing.'
    },
    {
      icon: Heart,
      title: 'Personal Touch',
      description: 'Every claim receives personal attention and care.'
    }
  ]

  return (
    <section id="claims" ref={ref} className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Claims Management
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6">
            We support you every step of the way to ensure you get the compensation you deserve.
          </p>
          <div className="bg-primary rounded-xl p-6 text-white max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-2">"We Stay With You From Policy to Payout"</h3>
            <p className="text-sm opacity-90">
              Our commitment doesn't end at purchase. We're with you throughout your insurance journey, especially during claims.
            </p>
          </div>
        </motion.div>

        {/* Claims Process */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Claims Process</h3>
          <div className="space-y-4">
            {claimsProcess.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-100"
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === step.title ? null : step.title)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                      expandedStep === step.title ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedStep === step.title && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                        <span className="text-sm text-gray-600">{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Support Features */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gray-50 rounded-xl p-6 mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Our Claims Support Stands Out</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-primary rounded-xl p-6 sm:p-8 text-white">
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Need to File a Claim?</h3>
            <p className="text-sm sm:text-base mb-6 opacity-90">
              Don't navigate alone. Our experts are ready to help you get the compensation you deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+254729911311"
                className="bg-secondary text-primary px-6 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-secondary/90 transition-colors duration-200 inline-flex items-center justify-center group"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Call: +254 729 911 311
              </a>
              <button 
                onClick={() => {
                  const element = document.querySelector('#contact')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="bg-white text-primary px-6 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center group"
              >
                Contact Online
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ClaimsSection
