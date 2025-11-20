'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Shield, 
  Users, 
  Award, 
  Clock, 
  CheckCircle, 
  Star,
  TrendingUp,
  Heart,
  ArrowRight
} from 'lucide-react'

const WhyChooseUsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const differentiators = [
    {
      icon: Shield,
      title: 'Licensed & Regulated',
      description: 'Fully licensed by IRA Kenya, ensuring compliance and trust.',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Client-First',
      description: 'Your needs come first. We prioritize your interests.',
      color: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: Award,
      title: 'Trusted Partners',
      description: 'Partner with Kenya\'s leading insurance providers.',
      color: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: Clock,
      title: 'Quick Response',
      description: 'Fast quotes, quick processing, rapid claims support.',
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
    <section id="why-choose-us" ref={ref} className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose GoldOak?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Your trusted partner in securing your future with integrity, expertise, and unwavering commitment.
          </p>
        </motion.div>

        {/* Differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {differentiators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mb-4`}>
                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Track Record</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">What Our Clients Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-secondary fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                  <div className="text-xs text-gray-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-center"
        >
          <div className="bg-primary rounded-xl p-6 sm:p-8 text-white">
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Ready to Experience the GoldOak Difference?</h3>
            <p className="text-sm sm:text-base mb-6 opacity-90">
              Join hundreds of satisfied clients who trust us with their insurance needs.
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
              Get Started Today
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default WhyChooseUsSection
