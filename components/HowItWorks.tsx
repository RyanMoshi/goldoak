'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { FileText, Search, CheckCircle, ArrowRight } from 'lucide-react'

const HowItWorks = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const steps = [
    {
      number: 1,
      title: "Tell Us What You Need",
      description: "Answer a few simple questions about your insurance needs, vehicle details, or property information.",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      number: 2,
      title: "Compare Quotes",
      description: "We'll search through 12+ top insurance companies in Kenya to find you the best rates and coverage options.",
      icon: Search,
      color: "from-secondary to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600"
    },
    {
      number: 3,
      title: "Get Covered",
      description: "Choose your preferred policy and get covered instantly. Our team will handle all the paperwork for you.",
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    }
  ]

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How It <span className="text-secondary">Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get the best insurance quotes in Kenya in just 3 simple steps. 
            Our process is designed to save you time and money.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-primary"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  {/* Step Number & Icon */}
                  <div className="relative mb-8">
                    <div className={`w-24 h-24 mx-auto rounded-full ${step.bgColor} flex items-center justify-center shadow-lg`}>
                      <step.icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-gray-100">
                      <span className="text-sm font-bold text-primary">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>

                  {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-8">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of Kenyans who have saved money on their insurance premiums.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/quote" className="btn-primary">
                Get Your Quote Now
              </a>
              <a href="/contact" className="btn-outline">
                Talk to an Expert
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
