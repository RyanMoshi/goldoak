'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { 
  Shield, 
  Users, 
  Award, 
  Clock, 
  CheckCircle, 
  Star,
  TrendingUp,
  Heart,
  ArrowRight,
  ChevronDown
} from 'lucide-react'

const WhyChooseUsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [showAll, setShowAll] = useState(false)

  const differentiators = [
    {
      icon: Shield,
      title: 'Licensed & Regulated',
      description: 'Fully licensed by IRA Kenya.',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Client-First',
      description: 'Your needs come first.',
      color: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: Award,
      title: 'Trusted Partners',
      description: 'Partner with Kenya\'s leading providers.',
      color: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: Clock,
      title: 'Quick Response',
      description: 'Fast quotes and rapid support.',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      icon: Heart,
      title: 'Personal Touch',
      description: 'Personalized service with dedicated support.',
      color: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      icon: TrendingUp,
      title: 'Competitive Rates',
      description: 'Best rates without compromising coverage.',
      color: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    }
  ]

  const stats = [
    { number: '500+', label: 'Clients', icon: Users },
    { number: '95%', label: 'Claims Success', icon: CheckCircle },
    { number: '24hrs', label: 'Response Time', icon: Clock },
    { number: '4.9/5', label: 'Satisfaction', icon: Star }
  ]

  const visibleDifferentiators = showAll ? differentiators : differentiators.slice(0, 3)

  return (
    <section id="why-choose-us" ref={ref} className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Why Choose GoldOak?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Your trusted partner in securing your future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {visibleDifferentiators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100"
            >
              <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center mb-2`}>
                <item.icon className={`w-4 h-4 ${item.iconColor}`} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {!showAll && (
          <div className="text-center mb-6">
            <button
              onClick={() => setShowAll(true)}
              className="text-primary text-xs font-semibold hover:text-primary/80"
            >
              Show More Benefits →
            </button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 mb-6"
        >
          <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center mb-4">Our Track Record</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-primary mb-1">{stat.number}</div>
                <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-primary rounded-lg p-4 sm:p-6 text-white">
            <h3 className="text-base sm:text-lg font-bold mb-2">Ready to Get Started?</h3>
            <p className="text-xs sm:text-sm mb-3 opacity-90">
              Join hundreds of satisfied clients.
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
              Get Started Today
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default WhyChooseUsSection
