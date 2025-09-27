'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, TrendingUp, Users, Award, Clock, CheckCircle } from 'lucide-react'

const PartnerBenefits = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const benefits = [
    {
      icon: Shield,
      title: 'Licensed & Regulated',
      description: 'All our partners are fully licensed by the Insurance Regulatory Authority (IRA) and comply with all regulatory requirements.'
    },
    {
      icon: TrendingUp,
      title: 'Competitive Rates',
      description: 'We negotiate the best rates with our partners to ensure you get the most value for your insurance premium.'
    },
    {
      icon: Users,
      title: 'Wide Network',
      description: 'Access to multiple insurance companies means more options and better coverage for your specific needs.'
    },
    {
      icon: Award,
      title: 'Quality Service',
      description: 'Our partners are selected based on their track record of excellent customer service and claims processing.'
    },
    {
      icon: Clock,
      title: 'Fast Claims',
      description: 'We work with partners who have streamlined claims processes to ensure quick settlement of valid claims.'
    },
    {
      icon: CheckCircle,
      title: 'Financial Strength',
      description: 'All our partners are financially stable and have strong ratings from international rating agencies.'
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
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Why Our <span className="text-primary">Partnerships Matter</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our strategic partnerships with leading insurance companies ensure you get 
            the best coverage, competitive rates, and exceptional service.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center group hover:border-primary/20 border border-gray-100"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-primary rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-white/90 mb-6 max-w-3xl mx-auto">
            Let us help you find the perfect insurance coverage from our trusted partners. 
            We'll compare options and find the best deal for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/quote" className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Your Quote
            </a>
            <a href="/contact" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PartnerBenefits
