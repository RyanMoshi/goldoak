'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star, Quote, ThumbsUp, Award, Shield } from 'lucide-react'

const Reviews = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const reviews = [
    {
      name: "John Mwangi",
      location: "Nairobi",
      rating: 5,
      text: "Goldoak helped me save over 30% on my car insurance. The process was so simple and their customer service is excellent. I recommend them to everyone!",
      insurance: "Motor Insurance",
      savings: "30%"
    },
    {
      name: "Sarah Wanjiku",
      location: "Mombasa",
      rating: 5,
      text: "I was skeptical about online insurance quotes, but Goldoak made it so easy. Got quotes from 5 different companies in minutes and saved a lot of money.",
      insurance: "Medical Insurance",
      savings: "25%"
    },
    {
      name: "Peter Kimani",
      location: "Kisumu",
      rating: 5,
      text: "The team at Goldoak is very professional. They helped me understand different insurance options and found the perfect coverage for my family.",
      insurance: "Life Insurance",
      savings: "40%"
    },
    {
      name: "Grace Akinyi",
      location: "Nakuru",
      rating: 5,
      text: "Excellent service! They handled my insurance claim quickly and efficiently. I'm so glad I chose Goldoak for my home insurance.",
      insurance: "Home Insurance",
      savings: "35%"
    },
    {
      name: "David Ochieng",
      location: "Eldoret",
      rating: 5,
      text: "I've been using Goldoak for 3 years now. They always find me the best deals and their support team is always available when I need help.",
      insurance: "Motor Insurance",
      savings: "28%"
    },
    {
      name: "Mary Njoki",
      location: "Thika",
      rating: 5,
      text: "The comparison process was straightforward and I got my quotes within minutes. Saved me a lot of time and money. Highly recommended!",
      insurance: "Travel Insurance",
      savings: "22%"
    }
  ]

  const stats = [
    { number: "4.9/5", label: "Average Rating", icon: Star },
    { number: "5,000+", label: "Happy Customers", icon: ThumbsUp },
    { number: "35%", label: "Average Savings", icon: Award },
    { number: "12+", label: "Insurance Partners", icon: Shield }
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
            What Our <span className="text-gradient">Customers Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what real customers across Kenya have to say about their experience with Goldoak.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-secondary fill-current" />
                  ))}
                </div>
                <div className="ml-auto text-sm text-gray-500">{review.insurance}</div>
              </div>
              
              <blockquote className="text-gray-700 mb-4 leading-relaxed">
                "{review.text}"
              </blockquote>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{review.name}</div>
                  <div className="text-sm text-gray-500">{review.location}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">Saved {review.savings}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Join Thousands of Satisfied Customers</h3>
          <p className="text-lg opacity-90 mb-6">
            Experience the Goldoak difference and save money on your insurance today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/quote" className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Get Your Free Quote
            </a>
            <a href="/contact" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary transition-colors">
              Read More Reviews
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Reviews
