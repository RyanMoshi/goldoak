'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Target, Heart, Users, Award, CheckCircle } from 'lucide-react'

const AboutSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const values = [
    {
      icon: Shield,
      title: 'Integrity',
      description: 'We maintain the highest ethical standards in all our dealings with clients and partners.'
    },
    {
      icon: Heart,
      title: 'Customer Centricity',
      description: 'Our clients\' needs and satisfaction are at the heart of everything we do.'
    },
    {
      icon: Award,
      title: 'Value for Money',
      description: 'We ensure our clients get the best coverage at competitive rates without compromising quality.'
    },
    {
      icon: Target,
      title: 'Solution-Driven',
      description: 'We focus on finding the right insurance solutions tailored to each client\'s unique needs.'
    },
    {
      icon: Users,
      title: 'Ongoing Support',
      description: 'We provide continuous support from policy inception to claims settlement and beyond.'
    }
  ]

  return (
    <section id="about" ref={ref} className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Company Profile */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About GoldOak Insurance Agency
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              GoldOak Insurance Agency is a licensed and registered insurance intermediary in Kenya, 
              regulated by the Insurance Regulatory Authority (IRA). We partner with top insurance 
              providers to deliver reliable, accessible, and client-focused solutions across multiple sectors.
            </p>
            <div className="inline-flex items-center space-x-2 bg-primary text-white rounded-full px-6 py-3">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Licensed by IRA Kenya</span>
            </div>
          </div>
        </motion.div>

        {/* Vision, Mission, Values Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be Kenya's most trusted insurance partner, empowering individuals and businesses 
                to secure their future through comprehensive, accessible, and reliable insurance solutions.
              </p>
            </div>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide exceptional insurance services by connecting clients with the best 
                insurance products, offering personalized guidance, and ensuring seamless claims 
                processing for complete peace of mind.
              </p>
            </div>
          </motion.div>

          {/* Values Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
              <p className="text-gray-600 leading-relaxed">
                Integrity, Customer Centricity, Value for Money, Solution-Driven approach, 
                and Ongoing Support guide everything we do.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Core Values Detail */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h4>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection
