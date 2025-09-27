'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Heart, 
  Shield, 
  Car, 
  Home, 
  Plane, 
  GraduationCap, 
  Building2, 
  Users,
  ArrowRight 
} from 'lucide-react'
import Link from 'next/link'

const ProductCategories = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const categories = [
    {
      icon: Heart,
      title: 'Medical Insurance',
      description: 'Comprehensive health coverage for individuals, families, and groups with access to quality healthcare.',
      features: ['Inpatient & Outpatient', 'Maternity Cover', 'Dental & Optical', 'Emergency Evacuation'],
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Life Insurance',
      description: 'Secure your family\'s future with life insurance plans that provide financial protection and peace of mind.',
      features: ['Term Life', 'Whole Life', 'Endowment Plans', 'Funeral Cover'],
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Car,
      title: 'Motor Insurance',
      description: 'Complete motor vehicle insurance coverage including comprehensive, third party, and commercial vehicle insurance.',
      features: ['Comprehensive Cover', 'Third Party', 'Commercial Vehicles', 'Motorcycle Insurance'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Home,
      title: 'Home Insurance',
      description: 'Protect your home and belongings with comprehensive home insurance coverage against various risks.',
      features: ['Building Cover', 'Contents Insurance', 'Liability Cover', 'Natural Disasters'],
      color: 'from-orange-500 to-yellow-500'
    },
    {
      icon: Plane,
      title: 'Travel Insurance',
      description: 'Travel with confidence knowing you\'re covered for medical emergencies, trip cancellations, and more.',
      features: ['Medical Emergency', 'Trip Cancellation', 'Baggage Loss', 'Personal Liability'],
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: GraduationCap,
      title: 'Education Plans',
      description: 'Secure your children\'s education with education savings plans and school fees insurance.',
      features: ['Education Savings', 'School Fees Cover', 'Scholarship Plans', 'University Funding'],
      color: 'from-teal-500 to-cyan-500'
    },
    {
      icon: Building2,
      title: 'Corporate Insurance',
      description: 'Comprehensive business insurance solutions for SMEs and large corporations.',
      features: ['Group Medical', 'Group Life', 'Professional Indemnity', 'Business Interruption'],
      color: 'from-gray-500 to-slate-500'
    },
    {
      icon: Users,
      title: 'Microinsurance',
      description: 'Affordable insurance products designed for low-income individuals and cooperatives.',
      features: ['Affordable Premiums', 'Simple Claims', 'Community Based', 'Mobile Payments'],
      color: 'from-indigo-500 to-blue-500'
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
            Insurance <span className="text-primary">Product Categories</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We offer comprehensive insurance solutions across all major categories, 
            tailored to meet your specific needs and budget.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-primary/20 group"
            >
              <div className="flex flex-col h-full">
                <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {category.title}
                </h3>
                
                <p className="text-gray-600 mb-4 flex-grow">
                  {category.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  {category.features.map((feature, featureIndex) => (
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
      </div>
    </section>
  )
}

export default ProductCategories
