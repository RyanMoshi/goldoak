'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Heart, 
  Car, 
  Home, 
  Plane, 
  GraduationCap, 
  Building2, 
  Shield, 
  Users,
  ArrowRight 
} from 'lucide-react'
import Link from 'next/link'

const Services = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const services = [
    {
      icon: Heart,
      title: 'Medical Insurance',
      description: 'Comprehensive health coverage for individuals, families, and groups with access to quality healthcare.',
      features: ['Inpatient & Outpatient', 'Maternity Cover', 'Dental & Optical', 'Emergency Evacuation']
    },
    {
      icon: Shield,
      title: 'Life Insurance',
      description: 'Secure your family\'s future with life insurance plans that provide financial protection and peace of mind.',
      features: ['Term Life', 'Whole Life', 'Endowment Plans', 'Funeral Cover']
    },
    {
      icon: Car,
      title: 'Motor Insurance',
      description: 'Complete motor vehicle insurance coverage including comprehensive, third party, and commercial vehicle insurance.',
      features: ['Comprehensive Cover', 'Third Party', 'Commercial Vehicles', 'Motorcycle Insurance']
    },
    {
      icon: Home,
      title: 'Home Insurance',
      description: 'Protect your home and belongings with comprehensive home insurance coverage against various risks.',
      features: ['Building Cover', 'Contents Insurance', 'Liability Cover', 'Natural Disasters']
    },
    {
      icon: Plane,
      title: 'Travel Insurance',
      description: 'Travel with confidence knowing you\'re covered for medical emergencies, trip cancellations, and more.',
      features: ['Medical Emergency', 'Trip Cancellation', 'Baggage Loss', 'Personal Liability']
    },
    {
      icon: GraduationCap,
      title: 'Education Plans',
      description: 'Secure your children\'s education with education savings plans and school fees insurance.',
      features: ['Education Savings', 'School Fees Cover', 'Scholarship Plans', 'University Funding']
    },
    {
      icon: Building2,
      title: 'Corporate Insurance',
      description: 'Comprehensive business insurance solutions for SMEs and large corporations.',
      features: ['Group Medical', 'Group Life', 'Professional Indemnity', 'Business Interruption']
    },
    {
      icon: Users,
      title: 'Microinsurance',
      description: 'Affordable insurance products designed for low-income individuals and cooperatives.',
      features: ['Affordable Premiums', 'Simple Claims', 'Community Based', 'Mobile Payments']
    }
  ]

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Our Insurance <span className="text-primary">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We offer comprehensive insurance solutions tailored to meet your unique needs, 
            backed by Kenya's leading insurance companies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-primary/20 group"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-4 flex-grow">
                  {service.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-3"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <Link 
                  href="/quote" 
                  className="inline-flex items-center text-primary font-medium hover:text-secondary transition-colors group/link"
                >
                  Get Quote
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link href="/products" className="btn-primary">
            View All Products
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default Services
