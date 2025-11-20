'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Shield, Target, Heart, Users, Award, CheckCircle, ChevronDown } from 'lucide-react'

const AboutSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [expandedValue, setExpandedValue] = useState<string | null>(null)

  const values = [
    {
      icon: Shield,
      title: 'Integrity',
      description: 'Highest ethical standards in all dealings.'
    },
    {
      icon: Heart,
      title: 'Customer Centricity',
      description: 'Client needs and satisfaction are our priority.'
    },
    {
      icon: Award,
      title: 'Value for Money',
      description: 'Best coverage at competitive rates.'
    },
    {
      icon: Target,
      title: 'Solution-Driven',
      description: 'Tailored insurance solutions for unique needs.'
    },
    {
      icon: Users,
      title: 'Ongoing Support',
      description: 'Continuous support from policy to claims.'
    }
  ]

  return (
    <section id="about" ref={ref} className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Company Profile */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            About GoldOak
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6">
              Licensed insurance intermediary in Kenya, regulated by IRA. We partner with top providers to deliver reliable, client-focused solutions.
            </p>
            <div className="inline-flex items-center space-x-2 bg-primary text-white rounded-full px-4 py-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Licensed by IRA Kenya</span>
            </div>
          </div>
        </motion.div>

        {/* Vision, Mission, Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vision</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Kenya's most trusted insurance partner, empowering individuals and businesses to secure their future.
              </p>
            </div>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mission</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Connect clients with the best insurance products, offer personalized guidance, and ensure seamless claims processing.
              </p>
            </div>
          </motion.div>

          {/* Values Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Values</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Integrity, Customer Focus, Value, Solutions, and Ongoing Support guide everything we do.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Core Values Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">Our Core Values</h3>
          <div className="space-y-3">
            {values.map((value) => (
              <div key={value.title} className="border-b border-gray-100 last:border-0">
                <button
                  onClick={() => setExpandedValue(expandedValue === value.title ? null : value.title)}
                  className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{value.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{value.description}</p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                      expandedValue === value.title ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection
