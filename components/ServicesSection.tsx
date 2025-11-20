'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { 
  Heart, 
  Car, 
  Home, 
  Building2, 
  Users, 
  Briefcase, 
  CheckCircle, 
  ArrowRight,
  ChevronDown
} from 'lucide-react'

const ServicesSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const services = [
    {
      icon: Heart,
      title: 'Medical Insurance',
      description: 'Health coverage for individuals, families, and groups.',
      features: ['Inpatient', 'Outpatient', 'Maternity', 'Dental & Optical', 'Emergency'],
      color: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      icon: Users,
      title: 'Life Insurance',
      description: 'Secure your family\'s future.',
      features: ['Future Finance', 'Income Protection', 'Whole Life', 'Term Life', 'Education Plans'],
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Building2,
      title: 'Group & Corporate',
      description: 'Tailored solutions for businesses.',
      features: ['Group Health', 'Group Life', 'WIBA Compliance', 'Pension Schemes', 'Employee Benefits'],
      color: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: Car,
      title: 'Motor Insurance',
      description: 'Protect your vehicles.',
      features: ['Private Vehicle', 'Commercial Vehicle', 'PSV Insurance', 'Third Party', 'Comprehensive'],
      color: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: Home,
      title: 'Property Insurance',
      description: 'Safeguard your property.',
      features: ['Home Insurance', 'Fire Protection', 'Contents', 'Building Insurance', 'Rental Protection'],
      color: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      icon: Briefcase,
      title: 'Custom & Executive',
      description: 'Specialized solutions for high-net-worth.',
      features: ['Executive Health', 'High-Value Property', 'Custom Risk', 'Premium Services', 'Dedicated Support'],
      color: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    }
  ]

  const visibleServices = showAll ? services : services.slice(0, 2)

  return (
    <section id="services" ref={ref} className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Our Insurance Products
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Comprehensive insurance solutions across multiple sectors.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {visibleServices.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100"
            >
              <div className={`w-8 h-8 ${service.color} rounded-full flex items-center justify-center mb-2`}>
                <service.icon className={`w-4 h-4 ${service.iconColor}`} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{service.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{service.description}</p>

              <button
                onClick={() => setExpandedService(expandedService === service.title ? null : service.title)}
                className="w-full flex items-center justify-between text-xs font-medium text-primary mb-2"
              >
                <span>Details</span>
                <ChevronDown 
                  className={`w-3 h-3 transition-transform ${
                    expandedService === service.title ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedService === service.title && (
                <div className="space-y-1 pt-2 border-t border-gray-100 mb-2">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-1.5">
                      <CheckCircle className="w-2.5 h-2.5 text-secondary flex-shrink-0" />
                      <span className="text-xs text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              <button className="w-full bg-primary text-white py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">
                Get Quote
              </button>
            </motion.div>
          ))}
        </div>

        {!showAll && (
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAll(true)}
              className="text-primary text-xs font-semibold hover:text-primary/80"
            >
              Show All Services →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default ServicesSection
