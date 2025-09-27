'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Linkedin, Mail, Phone } from 'lucide-react'

const Team = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const teamMembers = [
    {
      name: 'John Mwangi',
      role: 'Managing Director',
      experience: '15+ years in insurance',
      description: 'John leads our team with extensive experience in insurance and risk management.',
      image: '/api/placeholder/300/300',
      email: 'john@goldoak.co.ke',
      phone: '+254 700 000 001'
    },
    {
      name: 'Sarah Wanjiku',
      role: 'Head of Operations',
      experience: '12+ years in insurance',
      description: 'Sarah ensures smooth operations and excellent client service delivery.',
      image: '/api/placeholder/300/300',
      email: 'sarah@goldoak.co.ke',
      phone: '+254 700 000 002'
    },
    {
      name: 'David Kimani',
      role: 'Senior Insurance Advisor',
      experience: '10+ years in insurance',
      description: 'David specializes in corporate insurance and risk assessment.',
      image: '/api/placeholder/300/300',
      email: 'david@goldoak.co.ke',
      phone: '+254 700 000 003'
    },
    {
      name: 'Grace Akinyi',
      role: 'Client Relations Manager',
      experience: '8+ years in insurance',
      description: 'Grace manages client relationships and ensures customer satisfaction.',
      image: '/api/placeholder/300/300',
      email: 'grace@goldoak.co.ke',
      phone: '+254 700 000 004'
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
            Meet Our <span className="text-primary">Expert Team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our experienced professionals are dedicated to providing you with the best 
            insurance solutions and exceptional service.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:border-primary/20 border border-gray-100"
            >
              <div className="relative overflow-hidden">
                <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-primary font-medium mb-1">{member.role}</p>
                <p className="text-sm text-gray-600 mb-3">{member.experience}</p>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{member.description}</p>
                
                <div className="flex space-x-3">
                  <a
                    href={`mailto:${member.email}`}
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                  </a>
                  <a
                    href={`tel:${member.phone}`}
                    className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center hover:bg-secondary/20 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-secondary" />
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-gray-600" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Team
