'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  MessageCircle, 
  FileText, 
  Users, 
  CheckCircle, 
  HeadphonesIcon,
  ArrowRight
} from 'lucide-react'

const ProcessSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const steps = [
    {
      number: '01',
      icon: MessageCircle,
      title: 'Consultation & Needs Assessment',
      description: 'We start with a detailed consultation to understand your specific insurance needs, risk profile, and budget requirements.',
      details: [
        'Initial consultation call or meeting',
        'Risk assessment and analysis',
        'Budget and coverage requirements discussion',
        'Documentation review'
      ]
    },
    {
      number: '02',
      icon: FileText,
      title: 'Custom Proposal & Competitive Quotes',
      description: 'We prepare tailored proposals with quotes from multiple top insurance providers to give you the best options.',
      details: [
        'Market research and provider comparison',
        'Custom proposal preparation',
        'Multiple quote options',
        'Coverage comparison and recommendations'
      ]
    },
    {
      number: '03',
      icon: Users,
      title: 'Guidance on Selection',
      description: 'Our experts guide you through the selection process, explaining terms, conditions, and helping you make informed decisions.',
      details: [
        'Policy comparison and analysis',
        'Terms and conditions explanation',
        'Coverage recommendations',
        'Decision support and guidance'
      ]
    },
    {
      number: '04',
      icon: CheckCircle,
      title: 'Onboarding & Activation',
      description: 'We handle all the paperwork and ensure your policy is activated smoothly with all necessary documentation.',
      details: [
        'Application processing',
        'Documentation completion',
        'Policy activation',
        'Welcome package delivery'
      ]
    },
    {
      number: '05',
      icon: HeadphonesIcon,
      title: 'Ongoing Client Support',
      description: 'We provide continuous support throughout your policy term, including claims assistance and policy management.',
      details: [
        'Regular policy reviews',
        'Claims support and guidance',
        'Policy updates and modifications',
        'Renewal assistance'
      ]
    }
  ]

  return (
    <section id="process" ref={ref} className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How We Work
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Our streamlined process ensures you get the right insurance coverage 
            with minimal hassle and maximum support throughout your journey.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`flex flex-col lg:flex-row items-center gap-8 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className="flex-1">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                      {step.number}
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{step.description}</p>
                  
                  <div className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual Element */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <step.icon className="w-16 h-16 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
            <p className="text-gray-600 mb-6">
              Begin your insurance journey with us today. Our experts are ready to guide you through every step.
            </p>
            <button 
              onClick={() => {
                const element = document.querySelector('#contact')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200 inline-flex items-center group"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProcessSection
