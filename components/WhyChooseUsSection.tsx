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
      description: 'Fully licensed by the Insurance Regulatory Authority (IRA) of Kenya, ensuring compliance and trust.',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Client-First Approach',
      description: 'Your needs come first. We prioritize your interests and work tirelessly to find the best solutions.',
      color: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: Award,
      title: 'Trusted Partners',
      description: 'We partner with Kenya\'s leading insurance providers to bring you the best coverage options.',
      color: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: Clock,
      title: 'Quick Response',
      description: 'Fast quotes, quick processing, and rapid claims support when you need it most.',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      icon: Heart,
      title: 'Personal Touch',
      description: 'We provide personalized service with dedicated support throughout your insurance journey.',
      color: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      icon: TrendingUp,
      title: 'Competitive Rates',
      description: 'Access to multiple providers ensures you get the best rates without compromising on coverage.',
      color: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    }
  ]

  const stats = [
    { number: '500+', label: 'Clients Served', icon: Users },
    { number: '95%', label: 'Claims Success Rate', icon: CheckCircle },
    { number: '24hrs', label: 'Average Response Time', icon: Clock },
    { number: '4.9/5', label: 'Client Satisfaction', icon: Star }
  ]

  const testimonials = [
    {
      name: 'Sarah Mwangi',
      role: 'Business Owner',
      content: 'GoldOak made finding the right insurance so easy. Their team was professional, responsive, and helped me get comprehensive coverage at a great rate.',
      rating: 5
    },
    {
      name: 'John Kimani',
      role: 'Family Man',
      content: 'When I had to make a claim, GoldOak was there every step of the way. They handled everything professionally and I got my compensation quickly.',
      rating: 5
    },
    {
      name: 'Grace Wanjiku',
      role: 'Corporate Client',
      content: 'We\'ve been working with GoldOak for our corporate insurance needs for over 2 years. Their service is exceptional and their rates are competitive.',
      rating: 5
    }
  ]

  return (
    <section id="why-choose-us" ref={ref} className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose GoldOak Insurance?
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            We're not just another insurance agency. We're your trusted partner in securing 
            your future with integrity, expertise, and unwavering commitment to your success.
          </p>
        </motion.div>

        {/* Differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {differentiators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mb-6`}>
                <item.icon className={`w-8 h-8 ${item.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Track Record</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">What Our Clients Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-secondary fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Partner Logos Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Trusted Partners</h3>
          <p className="text-gray-600 text-center mb-8">
            We partner with Kenya's leading insurance providers to bring you the best coverage options.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-32 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm">Partner {i}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="text-center"
        >
          <div className="bg-primary rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Experience the GoldOak Difference?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join hundreds of satisfied clients who trust us with their insurance needs.
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
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default WhyChooseUsSection
