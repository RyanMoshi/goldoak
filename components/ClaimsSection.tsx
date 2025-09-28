'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  FileCheck, 
  Users, 
  Clock, 
  CheckCircle, 
  Shield, 
  Phone,
  ArrowRight,
  Heart
} from 'lucide-react'

const ClaimsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const claimsProcess = [
    {
      icon: FileCheck,
      title: 'Documentation & Evidence',
      description: 'We help you gather and organize all necessary documentation and evidence for your claim.',
      details: [
        'Claim form completion assistance',
        'Document collection guidance',
        'Evidence preparation support',
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
        'Technical claim discussions'
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
        'Communication transparency'
      ]
    },
    {
      icon: CheckCircle,
      title: 'Compensation Disbursement',
      description: 'We follow through until your compensation is fully disbursed.',
      details: [
        'Payment tracking',
        'Disbursement coordination',
        'Final settlement confirmation',
        'Post-claim support'
      ]
    }
  ]

  const supportFeatures = [
    {
      icon: Shield,
      title: 'Expert Claims Handling',
      description: 'Our experienced team knows the ins and outs of insurance claims processing.'
    },
    {
      icon: Phone,
      title: '24/7 Support',
      description: 'Round-the-clock support when you need it most during claims processing.'
    },
    {
      icon: Heart,
      title: 'Personal Touch',
      description: 'We treat every claim with personal attention and care, understanding your unique situation.'
    }
  ]

  return (
    <section id="claims" ref={ref} className="section-padding bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Claims Management & Support
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            When you need to make a claim, we're here to support you every step of the way. 
            Our comprehensive claims management ensures you get the compensation you deserve.
          </p>
          <div className="bg-primary rounded-2xl p-6 text-white max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">"We Stay With You From Policy to Payout"</h3>
            <p className="text-lg opacity-90">
              Our commitment doesn't end when you purchase a policy. We're with you throughout 
              your entire insurance journey, especially when you need us most during claims.
            </p>
          </div>
        </motion.div>

        {/* Claims Process */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Claims Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {claimsProcess.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mr-4">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">{step.title}</h4>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">{step.description}</p>
                <div className="space-y-3">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="text-sm text-gray-600">{detail}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Support Features */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-gray-50 rounded-2xl p-8 mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Our Claims Support Stands Out</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-secondary" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <div className="bg-primary rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Need to File a Claim?</h3>
            <p className="text-lg mb-6 opacity-90">
              Don't navigate the claims process alone. Our experts are ready to help you 
              get the compensation you deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+254729911311"
                className="bg-secondary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-secondary/90 transition-colors duration-200 inline-flex items-center justify-center group"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Now: +254 729 911 311
              </a>
              <button 
                onClick={() => {
                  const element = document.querySelector('#contact')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center group"
              >
                Contact Us Online
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ClaimsSection
