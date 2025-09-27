'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Phone, Mail, MapPin, Clock, MessageCircle, Users, Award, Shield } from 'lucide-react'

const ContactInfo = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone',
      description: 'Call us for immediate assistance',
      contact: '+254 729 911 311',
      action: 'tel:+254729911311',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Quick responses via WhatsApp',
      contact: '+254 729 911 311',
      action: 'https://wa.me/254729911311',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'Send us your insurance needs',
      contact: 'info@goldoak.co.ke',
      action: 'mailto:info@goldoak.co.ke',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: MapPin,
      title: 'Office',
      description: 'Visit our office in Nairobi',
      contact: 'Nairobi, Kenya',
      action: '#',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const officeHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
    { day: 'Emergency', hours: '24/7 Available' }
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
            Contact <span className="text-primary">Information</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your preferred way to get in touch with us. We're here to help 
            you find the perfect insurance solution.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.action}
              target={method.action.startsWith('http') ? '_blank' : undefined}
              rel={method.action.startsWith('http') ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className={`${method.bgColor} rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
                <div className={`w-16 h-16 ${method.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <method.icon className={`w-8 h-8 ${method.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <p className={`font-semibold ${method.color}`}>{method.contact}</p>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gray-50 rounded-2xl p-8"
          >
            <div className="flex items-center mb-6">
              <Clock className="w-8 h-8 text-primary mr-4" />
              <h3 className="text-2xl font-bold text-gray-900">Office Hours</h3>
            </div>
            
            <div className="space-y-4">
              {officeHours.map((schedule, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                  <span className="font-medium text-gray-900">{schedule.day}</span>
                  <span className="text-gray-600">{schedule.hours}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Emergency Support:</strong> Available 24/7 for urgent insurance matters. 
                Call our emergency line for immediate assistance.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-primary/5 rounded-2xl p-8"
          >
            <div className="flex items-center mb-6">
              <Users className="w-8 h-8 text-primary mr-4" />
              <h3 className="text-2xl font-bold text-gray-900">Why Contact Us?</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Award className="w-5 h-5 text-secondary mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Expert Advice</h4>
                  <p className="text-sm text-gray-600">Get professional guidance from our experienced insurance advisors.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-secondary mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Licensed & Regulated</h4>
                  <p className="text-sm text-gray-600">We are fully licensed by the Insurance Regulatory Authority.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MessageCircle className="w-5 h-5 text-secondary mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Quick Response</h4>
                  <p className="text-sm text-gray-600">We respond to all inquiries within 2 hours during business hours.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="w-5 h-5 text-secondary mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Personalized Service</h4>
                  <p className="text-sm text-gray-600">Tailored insurance solutions that meet your specific needs.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactInfo
