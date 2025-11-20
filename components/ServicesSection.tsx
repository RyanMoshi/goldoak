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
      features: ['Inpatient Coverage', 'Outpatient Services', 'Maternity Benefits', 'Dental & Optical', 'Emergency Services'],
      color: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      icon: Users,
      title: 'Life Insurance',
      description: 'Secure your family\'s future with comprehensive life insurance.',
      features: ['Future Finance Guidance', 'Income Protection', 'Whole Life Coverage', 'Term Life Plans', 'Education Plans'],
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Building2,
      title: 'Group & Corporate',
      description: 'Tailored insurance solutions for businesses and organizations.',
      features: ['Group Health Plans', 'Group Life Coverage', 'WIBA Compliance', 'Pension Schemes', 'Employee Benefits'],
      color: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: Car,
      title: 'Motor Insurance',
      description: 'Protect your vehicles with comprehensive motor coverage.',
      features: ['Private Vehicle Cover', 'Commercial Vehicle Cover', 'PSV Insurance', 'Third Party Liability', 'Comprehensive Coverage'],
      color: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: Home,
      title: 'Property Insurance',
      description: 'Safeguard your property and assets.',
      features: ['Home Insurance', 'Fire Protection', 'Contents Coverage', 'Building Insurance', 'Rental Protection'],
      color: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      icon: Briefcase,
      title: 'Custom & Executive',
      description: 'Specialized solutions for high-net-worth individuals.',
      features: ['Executive Health Plans', 'High-Value Property', 'Custom Risk Solutions', 'Premium Services', 'Dedicated Support'],
      color: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    }
  ]

  const visibleServices = showAll ? services : services.slice(0, 3)

  return (
    <section id="services" ref={ref} className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Our Insurance Products
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Comprehensive insurance solutions across multiple sectors.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {visibleServices.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
            >
              <div className={`w-10 h-10 ${service.color} rounded-full flex items-center justify-center mb-3`}>
                <service.icon className={`w-5 h-5 ${service.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">{service.description}</p>

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
                <div className="space-y-1.5 pt-2 border-t border-gray-100 mb-3">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-secondary flex-shrink-0" />
                      <span className="text-xs text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              <button className="w-full bg-primary text-white py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors">
                Get Quote
              </button>
            </motion.div>
          ))}
        </div>

        {/* Show More Button */}
        {!showAll && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(true)}
              className="text-primary text-sm font-semibold hover:text-primary/80"
            >
              Show All Services
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-8 sm:mt-12"
        >
          <div className="bg-primary rounded-xl p-4 sm:p-6 text-white">
            <h3 className="text-lg sm:text-xl font-bold mb-2">Need Help Choosing?</h3>
            <p className="text-xs sm:text-sm mb-4 opacity-90">
              Our advisors help you find the perfect solution.
            </p>
            <button 
              onClick={() => {
                const element = document.querySelector('#contact')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="bg-secondary text-primary px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-secondary/90 transition-colors"
            >
              Get Expert Advice
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ServicesSection
