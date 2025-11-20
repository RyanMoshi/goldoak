'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { 
  MessageCircle, 
  FileText, 
  Users, 
  CheckCircle, 
  HeadphonesIcon,
  ArrowRight,
  ChevronDown
} from 'lucide-react'

const ProcessSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const steps = [
    {
      number: '01',
      icon: MessageCircle,
      title: 'Consultation',
      description: 'Understand your needs and budget.',
      details: ['Initial consultation', 'Risk assessment', 'Budget discussion', 'Documentation review']
    },
    {
      number: '02',
      icon: FileText,
      title: 'Proposal & Quotes',
      description: 'Tailored proposals from multiple providers.',
      details: ['Market research', 'Custom proposals', 'Multiple quotes', 'Coverage recommendations']
    },
    {
      number: '03',
      icon: Users,
      title: 'Selection Guidance',
      description: 'Expert guidance through policy selection.',
      details: ['Policy comparison', 'Terms explanation', 'Recommendations', 'Decision support']
    },
    {
      number: '04',
      icon: CheckCircle,
      title: 'Activation',
      description: 'Handle paperwork and activate policy.',
      details: ['Application processing', 'Documentation', 'Policy activation', 'Welcome package']
    },
    {
      number: '05',
      icon: HeadphonesIcon,
      title: 'Ongoing Support',
      description: 'Continuous support and claims assistance.',
      details: ['Policy reviews', 'Claims support', 'Updates', 'Renewal assistance']
    }
  ]

  const visibleSteps = showAll ? steps : steps.slice(0, 3)

  return (
    <section id="process" ref={ref} className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            How We Work
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Streamlined process for the right coverage with maximum support.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="space-y-3 sm:space-y-4">
          {visibleSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
            >
              <button
                onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {step.number}
                  </div>
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                    expandedStep === step.number ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {expandedStep === step.number && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0"></div>
                      <span className="text-xs text-gray-600">{detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Show More Button */}
        {!showAll && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(true)}
              className="text-primary text-sm font-semibold hover:text-primary/80"
            >
              Show All Steps
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-8 sm:mt-12"
        >
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Ready to Get Started?</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Begin your insurance journey today.
            </p>
            <button 
              onClick={() => {
                const element = document.querySelector('#contact')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="bg-primary text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Start Your Journey
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProcessSection
