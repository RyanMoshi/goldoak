'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { 
  FileCheck, 
  Users, 
  Clock, 
  CheckCircle, 
  Phone,
  ChevronDown
} from 'lucide-react'

const ClaimsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [showProcess, setShowProcess] = useState(false)

  const claimsProcess = [
    {
      icon: FileCheck,
      title: 'Documentation',
      description: 'Help gather all necessary documentation.'
    },
    {
      icon: Users,
      title: 'Underwriter Engagement',
      description: 'Liaise with underwriters on your behalf.'
    },
    {
      icon: Clock,
      title: 'Regular Updates',
      description: 'Receive regular status updates.'
    },
    {
      icon: CheckCircle,
      title: 'Compensation',
      description: 'Follow through until full disbursement.'
    }
  ]

  return (
    <section id="claims" ref={ref} className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Claims Management
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">
            We support you every step to ensure you get the compensation you deserve.
          </p>
          <div className="bg-primary rounded-lg p-3 sm:p-4 text-white max-w-2xl mx-auto">
            <h3 className="text-base sm:text-lg font-bold mb-1">"We Stay With You From Policy to Payout"</h3>
            <p className="text-xs opacity-90">
              Our commitment doesn't end at purchase. We're with you throughout your journey.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-6"
        >
          <button
            onClick={() => setShowProcess(!showProcess)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Our Claims Process</h3>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform ${
                showProcess ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showProcess && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
              {claimsProcess.map((step, index) => (
                <div key={step.title} className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{step.title}</h4>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-primary rounded-lg p-4 sm:p-6 text-white">
            <h3 className="text-base sm:text-lg font-bold mb-2">Need to File a Claim?</h3>
            <p className="text-xs sm:text-sm mb-3 opacity-90">
              Don't navigate alone. Our experts are ready to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href="tel:+254729911311"
                className="bg-secondary text-primary px-4 py-2 rounded-lg text-xs font-semibold hover:bg-secondary/90 transition-colors inline-flex items-center justify-center"
              >
                <Phone className="w-3 h-3 mr-1.5" />
                Call: +254 729 911 311
              </a>
              <button 
                onClick={() => {
                  const element = document.querySelector('#contact')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
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
