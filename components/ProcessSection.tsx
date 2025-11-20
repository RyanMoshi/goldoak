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

  const steps = [
    {
      number: '01',
      icon: MessageCircle,
      title: 'Consultation & Assessment',
      description: 'We understand your insurance needs, risk profile, and budget.',
      details: [
        'Initial consultation call or meeting',
        'Risk assessment and analysis',
        'Budget and coverage discussion',
        'Documentation review'
      ]
    },
    {
      number: '02',
      icon: FileText,
      title: 'Custom Proposal & Quotes',
      description: 'Tailored proposals with quotes from multiple top providers.',
      details: [
        'Market research and comparison',
        'Custom proposal preparation',
        'Multiple quote options',
        'Coverage recommendations'
      ]
    },
    {
      number: '03',
      icon: Users,
      title: 'Selection Guidance',
      description: 'Expert guidance through policy selection and terms explanation.',
      details: [
        'Policy comparison',
        'Terms explanation',
        'Coverage recommendations',
        'Decision support'
      ]
    },
    {
      number: '04',
      icon: CheckCircle,
      title: 'Onboarding & Activation',
      description: 'We handle paperwork and ensure smooth policy activation.',
      details: [
        'Application processing',
        'Documentation completion',
        'Policy activation',
        'Welcome package'
      ]
    },
    {
      number: '05',
      icon: HeadphonesIcon,
      title: 'Ongoing Support',
      description: 'Continuous support including claims assistance and policy management.',
      details: [
        'Regular policy reviews',
        'Claims support',
        'Policy updates',
        'Renewal assistance'
      ]
    }
  ]

  return (
    <section id="process" ref={ref} className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How We Work
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Streamlined process for the right coverage with minimal hassle and maximum support.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <button
                onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {step.number}
                  </div>
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                    expandedStep === step.number ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {expandedStep === step.number && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-gray-600">{detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Get Started?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Begin your insurance journey today. Our experts are ready to guide you.
            </p>
            <button 
              onClick={() => {
                const element = document.querySelector('#contact')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="bg-primary text-white px-6 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-primary/90 transition-colors duration-200 inline-flex items-center group"
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProcessSection
