'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle,
  Calendar,
  FileText,
  X,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import QuoteModal from './QuoteModal'

const ContactSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      preferredDate: formData.get('preferredDate') as string,
      preferredTime: formData.get('preferredTime') as string,
      message: formData.get('message') as string,
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          subject: 'Call Booking Request',
          preferredContact: 'Phone'
        }),
      })

      if (response.ok) {
        toast.success('Call booking request submitted successfully! We\'ll contact you to confirm the appointment.')
        setIsBookingModalOpen(false)
        e.currentTarget.reset()
      } else {
        throw new Error('Failed to submit')
      }
    } catch (error) {
      toast.error('Failed to submit booking request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" ref={ref} className="py-12 px-4 sm:px-6 lg:px-8 bg-bg-section">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary mb-4">
              Get in Touch
            </h2>
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-10">
              Ready to secure your future? Contact us today for a free consultation or get an instant quote for your insurance needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid gap-6 sm:gap-8 sm:grid-cols-2 text-left"
          >
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-primary mb-4">Contact Information</h3>
              <div className="space-y-3">
                <p className="text-sm sm:text-base">
                  <strong className="text-gray-900">Phone:</strong> 
                  <a href="tel:+254729911311" className="text-secondary ml-2 hover:text-secondary/80 transition-colors">+254 729 911 311</a>
                </p>
                <p className="text-sm sm:text-base">
                  <strong className="text-gray-900">Email:</strong> 
                  <a href="mailto:info@goldoak.co.ke" className="text-secondary ml-2 hover:text-secondary/80 transition-colors">info@goldoak.co.ke</a>
                </p>
                <p className="text-sm sm:text-base">
                  <strong className="text-gray-900">WhatsApp:</strong> 
                  <a href="https://wa.me/254729911311" className="text-secondary ml-2 hover:text-secondary/80 transition-colors" target="_blank">Start Chat</a>
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-primary mb-4">Location & Hours</h3>
              <div className="space-y-3">
                <p className="text-sm sm:text-base">
                  <strong className="text-gray-900">Location:</strong> 
                  <span className="text-gray-700 ml-2">Nairobi, Kenya</span>
                </p>
                <p className="text-sm sm:text-base">
                  <strong className="text-gray-900">Business Hours:</strong>
                  <br/>
                  <span className="text-gray-700">Mon – Fri: 8:00 AM – 6:00 PM</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-8 sm:mt-12"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="w-full sm:w-auto bg-primary text-white py-3 px-6 sm:px-8 rounded-xl font-semibold hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center group text-sm sm:text-base"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Get a Quote
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full sm:w-auto bg-secondary text-primary py-3 px-6 sm:px-8 rounded-xl font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center group text-sm sm:text-base"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Book a Call
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Quote Modal */}
        <QuoteModal 
          isOpen={isQuoteModalOpen} 
          onClose={() => setIsQuoteModalOpen(false)} 
        />

        {/* Booking Modal */}
        {isBookingModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Book a Call</h3>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time *
                  </label>
                  <select
                    name="preferredTime"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  >
                    <option value="">Select preferred time</option>
                    <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                    <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                    <option value="evening">Evening (4:00 PM - 6:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would you like to discuss?
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 resize-none"
                    placeholder="Briefly describe what you'd like to discuss during the call..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ContactSection