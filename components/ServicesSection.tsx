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

  return (
    <section id="services" ref={ref} className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Our Insurance Products
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Comprehensive insurance solutions across multiple sectors, partnering with Kenya's leading providers.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-12 h-12 ${service.color} rounded-full flex items-center justify-center mb-4`}>
                <service.icon className={`w-6 h-6 ${service.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{service.description}</p>

              {/* Features Accordion */}
              <button
                onClick={() => setExpandedService(expandedService === service.title ? null : service.title)}
                className="w-full flex items-center justify-between text-sm font-medium text-primary mb-3 hover:text-primary/80 transition-colors"
              >
                <span>View Coverage Details</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${
                    expandedService === service.title ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedService === service.title && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-secondary flex-shrink-0" />
                      <span className="text-xs text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              <button className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors duration-200 inline-flex items-center justify-center group">
                Get Quote
                <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="bg-primary rounded-xl p-6 sm:p-8 text-white">
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Need Help Choosing Coverage?</h3>
            <p className="text-sm sm:text-base mb-6 opacity-90">
              Our advisors help you find the perfect insurance solution.
            </p>
            <button 
              onClick={() => {
                const element = document.querySelector('#contact')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="bg-secondary text-primary px-6 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-secondary/90 transition-colors duration-200 inline-flex items-center group"
            >
              Get Expert Advice
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ServicesSection
