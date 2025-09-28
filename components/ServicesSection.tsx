'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Heart, 
  Car, 
  Home, 
  Building2, 
  Users, 
  Briefcase, 
  Shield, 
  ArrowRight,
  CheckCircle 
} from 'lucide-react'

const ServicesSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const services = [
    {
      icon: Heart,
      title: 'Medical Insurance',
      description: 'Comprehensive health coverage for individuals, families, and groups.',
      features: ['Inpatient Coverage', 'Outpatient Services', 'Maternity Benefits', 'Dental & Optical', 'Emergency Services'],
      color: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      icon: Users,
      title: 'Life Insurance',
      description: 'Secure your family\'s future with comprehensive life insurance solutions.',
      features: ['Future Finance Guidance', 'Income Protection', 'Whole Life Coverage', 'Term Life Plans', 'Education Plans'],
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Building2,
      title: 'Group & Corporate Insurance',
      description: 'Tailored insurance solutions for businesses and organizations.',
      features: ['Group Health Plans', 'Group Life Coverage', 'WIBA Compliance', 'Pension Schemes', 'Employee Benefits'],
      color: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: Car,
      title: 'Motor Insurance',
      description: 'Protect your vehicles with comprehensive motor insurance coverage.',
      features: ['Private Vehicle Cover', 'Commercial Vehicle Cover', 'PSV Insurance', 'Third Party Liability', 'Comprehensive Coverage'],
      color: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: Home,
      title: 'Property Insurance',
      description: 'Safeguard your property and assets with comprehensive property insurance.',
      features: ['Home Insurance', 'Fire Protection', 'Contents Coverage', 'Building Insurance', 'Rental Protection'],
      color: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      icon: Briefcase,
      title: 'Custom & Executive Covers',
      description: 'Specialized insurance solutions for high-net-worth individuals and executives.',
      features: ['Executive Health Plans', 'High-Value Property', 'Custom Risk Solutions', 'Premium Services', 'Dedicated Support'],
      color: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    }
  ]

  return (
    <section id="services" ref={ref} className="section-padding bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Insurance Products
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            We offer comprehensive insurance solutions across multiple sectors, 
            partnering with Kenya's leading insurance providers to bring you the best coverage options.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
            >
              {/* Icon */}
              <div className={`w-16 h-16 ${service.color} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className={`w-8 h-8 ${service.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200 inline-flex items-center justify-center group">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-primary rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Need Help Choosing the Right Coverage?</h3>
            <p className="text-lg mb-6 opacity-90">
              Our experienced advisors are here to help you find the perfect insurance solution for your needs.
            </p>
            <button 
              onClick={() => {
                const element = document.querySelector('#contact')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="bg-secondary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-secondary/90 transition-colors duration-200 inline-flex items-center group"
            >
              Get Expert Advice
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ServicesSection
