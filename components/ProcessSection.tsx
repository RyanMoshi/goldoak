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
      details: ['Initial consultation', 'Risk assessment', 'Budget discussion']
    },
    {
      number: '02',
      icon: FileText,
      title: 'Proposal & Quotes',
      description: 'Tailored proposals from multiple providers.',
      details: ['Market research', 'Custom proposals', 'Multiple quotes']
    },
    {
      number: '03',
      icon: Users,
      title: 'Selection Guidance',
      description: 'Expert guidance through policy selection.',
      details: ['Policy comparison', 'Terms explanation', 'Recommendations']
    },
    {
      number: '04',
      icon: CheckCircle,
      title: 'Activation',
      description: 'Handle paperwork and activate policy.',
      details: ['Application processing', 'Documentation', 'Policy activation']
    },
    {
      number: '05',
      icon: HeadphonesIcon,
      title: 'Ongoing Support',
      description: 'Continuous support and claims assistance.',
      details: ['Policy reviews', 'Claims support', 'Renewal assistance']
    }
  ]

  const visibleSteps = showAll ? steps : steps.slice(0, 2)

  return (
    <section id="process" ref={ref} className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            How We Work
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Streamlined process for the right coverage.
          </p>
        </motion.div>

        <div className="space-y-2 sm:space-y-3">
          {visibleSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100"
            >
              <button
                onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {step.number}
                  </div>
                  <div className="w-7 h-7 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">{step.title}</h3>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                </div>
                <ChevronDown 
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                    expandedStep === step.number ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {expandedStep === step.number && (
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center space-x-1.5">
                      <div className="w-1 h-1 bg-secondary rounded-full flex-shrink-0"></div>
                      <span className="text-xs text-gray-600">{detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {!showAll && (
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAll(true)}
              className="text-primary text-xs font-semibold hover:text-primary/80"
            >
              Show All Steps →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProcessSection
