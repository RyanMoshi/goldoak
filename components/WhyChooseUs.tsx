'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Award, Clock, Shield, Users, TrendingUp, CheckCircle, Star, Phone } from 'lucide-react'

const WhyChooseUs = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const features = [
    {
      icon: Award,
      title: "Licensed by IRA Kenya",
      description: "Fully licensed and regulated by the Insurance Regulatory Authority of Kenya",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Clock,
      title: "Over 10 Years Experience",
      description: "More than a decade of helping Kenyans find the best insurance deals",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Shield,
      title: "Quick Claims Assistance",
      description: "Our team helps you navigate the claims process quickly and efficiently",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Users,
      title: "5,000+ Happy Clients",
      description: "Trusted by thousands of individuals and businesses across Kenya",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: TrendingUp,
      title: "Save Up to 40%",
      description: "Our comparison platform helps you find the most competitive rates",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: CheckCircle,
      title: "100% Free Service",
      description: "No hidden fees, no obligations. We're paid by insurance companies, not you",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    }
  ]

  const stats = [
    { number: "12+", label: "Insurance Partners" },
    { number: "5,000+", label: "Happy Customers" },
    { number: "10+", label: "Years Experience" },
    { number: "40%", label: "Average Savings" }
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
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="text-gradient">Goldoak?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're Kenya's most trusted insurance comparison platform, helping you find the best coverage at the best prices.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-white text-center mb-16"
        >
          <h3 className="text-3xl font-bold mb-8">Our Impact in Numbers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gray-50 rounded-2xl p-8 lg:p-12"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-secondary fill-current" />
              ))}
            </div>
            <blockquote className="text-2xl font-medium text-gray-900 mb-6">
              "Goldoak helped me save over 30% on my car insurance. The process was so simple and their customer service is excellent. I recommend them to everyone!"
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">John Mwangi</div>
                <div className="text-gray-600">Nairobi, Kenya</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Save on Your Insurance?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of satisfied customers who have found better insurance deals through Goldoak.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/quote" className="btn-primary text-lg px-8 py-4">
                Get Your Free Quote
              </a>
              <a href="tel:+254729911311" className="btn-outline text-lg px-8 py-4 inline-flex items-center justify-center">
                <Phone className="w-5 h-5 mr-2" />
                Call Us Now
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default WhyChooseUs
