'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { FileText, Calendar, ArrowRight } from 'lucide-react'
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

    try {
      const formData = new FormData(e.currentTarget)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formName: 'Call Booking Request',
          fullName: formData.get('fullName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          preferredDate: formData.get('preferredDate'),
          preferredTime: formData.get('preferredTime'),
          preferredContact: 'Phone'
        }),
      })

      if (response.ok) {
        const { toast } = await import('react-hot-toast')
        toast.success('Call booking request submitted successfully! We\'ll contact you to confirm the appointment.')
        setIsBookingModalOpen(false)
        e.currentTarget.reset()
      } else {
        throw new Error('Failed to submit')
      }
    } catch (error) {
      const { toast } = await import('react-hot-toast')
      toast.error('Failed to submit booking request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" ref={ref} className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-bg-section">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-6"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-2">
              Get in Touch
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 mb-4">
              Ready to secure your future? Contact us today.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid gap-4 sm:grid-cols-2 text-left mb-6"
          >
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm sm:text-base font-semibold text-primary mb-2">Contact Info</h3>
              <div className="space-y-1.5 text-xs">
                <p><strong>Phone:</strong> <a href="tel:+254729911311" className="text-secondary hover:underline">+254 729 911 311</a></p>
                <p><strong>Email:</strong> <a href="mailto:info@goldoak.co.ke" className="text-secondary hover:underline">info@goldoak.co.ke</a></p>
                <p><strong>WhatsApp:</strong> <a href="https://wa.me/254729911311" className="text-secondary hover:underline" target="_blank">Start Chat</a></p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm sm:text-base font-semibold text-primary mb-2">Location & Hours</h3>
              <div className="space-y-1.5 text-xs">
                <p><strong>Location:</strong> <span className="text-gray-700">Nairobi, Kenya</span></p>
                <p><strong>Hours:</strong> <span className="text-gray-700">Mon – Fri: 8:00 AM – 6:00 PM</span></p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center"
          >
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="w-full sm:w-auto bg-primary text-white py-2.5 px-5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Get a Quote
              </button>
              
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full sm:w-auto bg-secondary text-primary py-2.5 px-5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-secondary/90 transition-colors inline-flex items-center justify-center"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Book a Call
              </button>
            </div>
          </motion.div>
        </div>

        <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
        
        {isBookingModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Book a Call</h3>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  name="preferredDate"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="time"
                  name="preferredTime"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ContactSection
