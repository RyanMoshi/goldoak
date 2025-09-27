'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Users, Award, Heart, Target, Lightbulb } from 'lucide-react'

const Values = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const values = [
    {
      icon: Shield,
      title: 'Integrity',
      description: 'We maintain the highest ethical standards in all our dealings, ensuring transparency and honesty in every interaction.'
    },
    {
      icon: Users,
      title: 'Client-Centric',
      description: 'Our clients are at the heart of everything we do. We prioritize their needs and work tirelessly to exceed expectations.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in service delivery, continuously improving our processes and staying updated with industry best practices.'
    },
    {
      icon: Heart,
      title: 'Compassion',
      description: 'We understand that insurance is about protecting what matters most. We approach every situation with empathy and care.'
    },
    {
      icon: Target,
      title: 'Reliability',
      description: 'Our clients can count on us to be there when they need us most, providing consistent and dependable service.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We embrace new technologies and innovative solutions to make insurance more accessible and efficient for our clients.'
    }
  ]

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Our Core <span className="text-primary">Values</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These values guide everything we do and shape our commitment to providing 
            exceptional insurance services to our clients.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center group hover:border-primary/20 border border-gray-100"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <value.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Values
