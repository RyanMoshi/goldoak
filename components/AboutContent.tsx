'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Target, Eye, Heart, Users } from 'lucide-react'

const AboutContent = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Who We Are
            </h2>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                Goldoak Insurance Agency Limited is a licensed insurance agency in Kenya, 
                regulated by the Insurance Regulatory Authority (IRA). We are committed to 
                helping individuals, families, SMEs, corporates, and institutions find the 
                best insurance products by working with the leading insurers in the market.
              </p>
              <p>
                Our mission is to help clients transfer unforeseen risks to dependable 
                insurance partners, providing peace of mind and financial security. We 
                believe that everyone deserves access to quality insurance coverage that 
                protects what matters most.
              </p>
              <p>
                With over 8 years of experience in the insurance industry, we have built 
                strong relationships with Kenya's top insurance companies, allowing us to 
                offer competitive rates and comprehensive coverage options.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-primary/5 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-primary mb-6">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To provide comprehensive insurance solutions that protect our clients' 
                assets, health, and future, while maintaining the highest standards of 
                professionalism and integrity.
              </p>
            </div>

            <div className="bg-secondary/5 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-secondary mb-6">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To be Kenya's most trusted insurance agency, known for exceptional 
                service, innovative solutions, and unwavering commitment to client satisfaction.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Goldoak Insurance?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Licensed & Regulated</h3>
              <p className="text-gray-600">
                Fully licensed by the Insurance Regulatory Authority, ensuring compliance and protection.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Transparent Process</h3>
              <p className="text-gray-600">
                Clear communication and transparent processes throughout your insurance journey.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Client-Focused</h3>
              <p className="text-gray-600">
                Your needs come first. We tailor solutions to match your specific requirements.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert Team</h3>
              <p className="text-gray-600">
                Experienced professionals dedicated to finding the best insurance solutions for you.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutContent
