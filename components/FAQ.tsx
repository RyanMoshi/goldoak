'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Plus, Minus, HelpCircle } from 'lucide-react'

const FAQ = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "How much can I save on my insurance?",
      answer: "On average, our customers save between 20-40% on their insurance premiums. The exact amount depends on your specific needs and the insurance company you choose. We compare quotes from 12+ top insurers to ensure you get the best deal."
    },
    {
      question: "Is your service really free?",
      answer: "Yes, our service is 100% free for customers. We're paid by insurance companies when you purchase a policy through us, not by you. There are no hidden fees, no obligations, and no charges for using our comparison platform."
    },
    {
      question: "How long does it take to get quotes?",
      answer: "Most quotes are generated instantly or within 2-3 minutes. For more complex insurance needs, it may take up to 24 hours. We'll notify you as soon as your quotes are ready via email or SMS."
    },
    {
      question: "Are you licensed to operate in Kenya?",
      answer: "Yes, Goldoak Insurance Agency is fully licensed and regulated by the Insurance Regulatory Authority (IRA) of Kenya. Our license number is [License Number]. We operate in compliance with all Kenyan insurance regulations."
    },
    {
      question: "What types of insurance do you compare?",
      answer: "We compare quotes for Motor Insurance, Medical Insurance, Life Insurance, Home Insurance, Travel Insurance, and Corporate Insurance. We work with all major insurance companies in Kenya including Jubilee, Britam, Old Mutual, CIC, AAR, and many more."
    },
    {
      question: "Can I get help with my insurance claim?",
      answer: "Absolutely! Our customer service team is available to help you with the claims process. We can guide you through the necessary steps and even liaise with your insurance company on your behalf to ensure a smooth claims experience."
    },
    {
      question: "Do I have to buy insurance through you?",
      answer: "No, there's no obligation to purchase insurance through us. You can use our service purely for comparison purposes. However, if you do choose to buy through us, you'll get the same price plus our additional support and service."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach us via phone at +254 729 911 311, email at info@goldoak.co.ke, WhatsApp, or through our contact form. Our customer support team is available Monday to Friday, 8 AM to 6 PM, and Saturday 9 AM to 2 PM."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section ref={ref} className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-6 py-3 mb-6">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Frequently Asked Questions</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Got <span className="text-secondary">Questions?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to the most common questions about our insurance comparison service. 
            Can't find what you're looking for? Contact us directly.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <Minus className="w-6 h-6 text-primary" />
                    ) : (
                      <Plus className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-primary rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-lg opacity-90 mb-6">
              Our insurance experts are here to help you find the perfect coverage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Contact Us
              </a>
              <a href="tel:+254729911311" className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary transition-colors">
                Call +254 729 911 311
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ
