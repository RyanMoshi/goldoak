'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Award, CheckCircle, FileText } from 'lucide-react'

const Licensing = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const certifications = [
    {
      title: 'IRA License',
      description: 'Licensed by the Insurance Regulatory Authority of Kenya',
      status: 'Active',
      number: 'IRA/AG/2024/001'
    },
    {
      title: 'Professional Indemnity',
      description: 'Comprehensive professional indemnity insurance coverage',
      status: 'Active',
      number: 'PI/2024/001'
    },
    {
      title: 'ISO 9001:2015',
      description: 'Quality management system certification',
      status: 'Certified',
      number: 'ISO/2024/001'
    },
    {
      title: 'Data Protection',
      description: 'Compliant with Kenya Data Protection Act',
      status: 'Compliant',
      number: 'DP/2024/001'
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
            Our <span className="text-primary">Licensing & Certifications</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are fully licensed and regulated, ensuring compliance with all 
            industry standards and regulations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center group hover:border-primary/20 border border-gray-100"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{cert.description}</p>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">{cert.status}</span>
              </div>
              <p className="text-xs text-gray-500">{cert.number}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-primary rounded-2xl p-8 text-white text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <Award className="w-12 h-12 text-secondary" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Regulatory Compliance</h3>
          <p className="text-white/90 mb-6 max-w-3xl mx-auto">
            As a licensed insurance agency, we are committed to maintaining the highest 
            standards of regulatory compliance and ethical business practices. Our 
            operations are regularly audited to ensure full compliance with all applicable 
            laws and regulations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Contact Us
            </a>
            <a href="/quote" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
              Get Quote
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Licensing
