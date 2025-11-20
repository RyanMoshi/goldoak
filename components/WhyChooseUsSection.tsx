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
  const [showStats, setShowStats] = useState(false)
  const [showTestimonials, setShowTestimonials] = useState(false)

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

  const testimonials = [
    {
      name: 'Sarah Mwangi',
      role: 'Business Owner',
      content: 'GoldOak made finding the right insurance easy. Professional, responsive, and great rates.',
      rating: 5
    },
    {
      name: 'John Kimani',
      role: 'Family Man',
      content: 'When I had to make a claim, GoldOak was there every step. Got my compensation quickly.',
      rating: 5
    },
    {
      name: 'Grace Wanjiku',
      role: 'Corporate Client',
      content: 'Working with GoldOak for 2+ years. Exceptional service and competitive rates.',
      rating: 5
    }
  ]

  return (
    <section id="why-choose-us" ref={ref} className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Why Choose GoldOak?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Your trusted partner in securing your future with integrity and expertise.
          </p>
        </motion.div>

        {/* Differentiators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {differentiators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
            >
              <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center mb-3`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-8 sm:mb-12"
        >
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center justify-between text-left mb-4"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Our Track Record</h3>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showStats ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stat.number}</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Testimonials - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mb-8 sm:mb-12"
        >
          <button
            onClick={() => setShowTestimonials(!showTestimonials)}
            className="w-full flex items-center justify-between text-left mb-6"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">What Our Clients Say</h3>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showTestimonials ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showTestimonials && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.name}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-secondary fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900 text-xs sm:text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-center"
        >
          <div className="bg-primary rounded-xl p-4 sm:p-6 text-white">
            <h3 className="text-lg sm:text-xl font-bold mb-2">Ready to Experience the GoldOak Difference?</h3>
            <p className="text-xs sm:text-sm mb-4 opacity-90">
              Join hundreds of satisfied clients who trust us.
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
