'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star, Quote } from 'lucide-react'

const Testimonials = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const testimonials = [
    {
      name: 'Sarah Wanjiku',
      role: 'Business Owner',
      company: 'Nairobi',
      content: 'Goldoak Insurance helped me find the perfect medical insurance for my family. Their team was professional, knowledgeable, and made the process so easy. I highly recommend them!',
      rating: 5,
      image: '/api/placeholder/60/60'
    },
    {
      name: 'John Mwangi',
      role: 'Corporate Client',
      company: 'Mombasa',
      content: 'We\'ve been working with Goldoak for our company\'s group insurance for over 3 years. They always deliver excellent service and competitive rates. Truly professional!',
      rating: 5,
      image: '/api/placeholder/60/60'
    },
    {
      name: 'Grace Akinyi',
      role: 'Individual Client',
      company: 'Kisumu',
      content: 'When I needed to claim on my motor insurance, Goldoak made the process seamless. They handled everything and I got my claim processed quickly. Great service!',
      rating: 5,
      image: '/api/placeholder/60/60'
    },
    {
      name: 'David Kimani',
      role: 'SME Owner',
      company: 'Nakuru',
      content: 'As a small business owner, I needed affordable but comprehensive insurance. Goldoak found me the perfect solution that fits my budget and covers all my needs.',
      rating: 5,
      image: '/api/placeholder/60/60'
    },
    {
      name: 'Mary Wanjiku',
      role: 'Family Client',
      company: 'Thika',
      content: 'The team at Goldoak is amazing! They helped me understand different insurance options and found the best coverage for my family. Very satisfied with their service.',
      rating: 5,
      image: '/api/placeholder/60/60'
    },
    {
      name: 'Peter Otieno',
      role: 'Corporate Client',
      company: 'Eldoret',
      content: 'Goldoak Insurance has been our trusted partner for years. Their expertise in corporate insurance is unmatched. They always go above and beyond for their clients.',
      rating: 5,
      image: '/api/placeholder/60/60'
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
            What Our <span className="text-primary">Clients Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our satisfied clients have to say about their experience with us.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 relative"
            >
              <div className="absolute top-6 right-6">
                <Quote className="w-8 h-8 text-primary/20" />
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-secondary fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-semibold text-lg">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-primary">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="bg-primary/5 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Join Our Happy Clients?
            </h3>
            <p className="text-gray-600 mb-6">
              Experience the same level of service and satisfaction that our clients rave about.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/quote" className="btn-primary">
                Get Your Quote Today
              </a>
              <a href="/contact" className="btn-outline">
                Contact Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
