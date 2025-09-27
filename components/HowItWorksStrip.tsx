'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { FileText, Search, CheckCircle } from 'lucide-react'

const HowItWorksStrip = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const steps = [
    {
      icon: FileText,
      title: "Choose",
      description: "Select your insurance type and provide basic details"
    },
    {
      icon: Search,
      title: "Compare", 
      description: "We search 12+ top insurers for the best rates"
    },
    {
      icon: CheckCircle,
      title: "Get Covered",
      description: "Choose your preferred policy and get covered instantly"
    }
  ]

  return (
    <section ref={ref} className="py-16 bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600">Get your insurance quote in 3 simple steps</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksStrip
