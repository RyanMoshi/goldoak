'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react'
import PageHero from '@/components/PageHero'
import AnimatedSection from '@/components/AnimatedSection'
import { contact } from '@/lib/contact'

interface FormData {
  name: string
  email: string
  phone: string
  clientType: string
  helpWith: string
  existingInsurance: string
  renewalDate: string
  description: string
  preferredContact: string
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: `Risk Review - ${data.clientType || 'General'}`,
          message: [
            data.helpWith && `Help with: ${data.helpWith}`,
            data.existingInsurance && `Existing insurance: ${data.existingInsurance}`,
            data.renewalDate && `Renewal date: ${data.renewalDate}`,
            data.description,
          ].filter(Boolean).join('\n'),
          preferredContact: data.preferredContact,
          type: 'risk_review',
        }),
      })

      if (!response.ok) throw new Error('Submission failed')

      setIsSubmitted(true)
      reset()
    } catch {
      setError('Something went wrong. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <PageHero
        title="Contact GoldOak"
        subtitle="Start with a conversation about your risk. Tell us what you own, what you run and who depends on you."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <AnimatedSection>
                <h2 className="font-serif text-heading-2 font-medium text-text-headline mb-6">
                  Get in touch
                </h2>

                <div className="space-y-6">
                  <a
                    href={`tel:${contact.phoneRaw}`}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/10 transition-colors">
                      <Phone className="w-5 h-5 text-primary group-hover:text-secondary transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-text-headline">{contact.phone}</p>
                      <p className="text-sm text-text-body">Call us</p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/10 transition-colors">
                      <Mail className="w-5 h-5 text-primary group-hover:text-secondary transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-text-headline">{contact.email}</p>
                      <p className="text-sm text-text-body">Email us</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-text-headline">{contact.location}</p>
                      <p className="text-sm text-text-body">Office</p>
                    </div>
                  </div>

                  <a
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/10 transition-colors">
                      <MessageCircle className="w-5 h-5 text-primary group-hover:text-secondary transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-text-headline">WhatsApp</p>
                      <p className="text-sm text-text-body">Message us anytime</p>
                    </div>
                  </a>
                </div>

                {/* Hours */}
                <div className="mt-8 p-6 bg-section-cream rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-secondary" />
                    <h3 className="font-serif font-medium text-text-headline">Business Hours</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-body">{contact.hours.weekday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-body">{contact.hours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-body">{contact.hours.sunday}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-secondary font-medium">{contact.hours.emergency}</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Risk Review Form */}
            <div className="lg:col-span-3">
              <AnimatedSection delay={100}>
                <div className="bg-section-cream rounded-2xl p-6 md:p-8 border border-gray-100">
                  <h2 className="font-serif text-heading-2 font-medium text-text-headline mb-2">
                    Start a Risk Review
                  </h2>
                  <p className="text-sm text-text-body mb-8">
                    Tell us about your situation and we will come back with the options worth considering.
                  </p>

                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
                      <h3 className="font-serif text-heading-3 font-medium text-text-headline mb-2">
                        Thank you
                      </h3>
                      <p className="text-body text-text-body max-w-md mx-auto">
                        We have received your enquiry. A member of the GoldOak team will be in 
                        touch within one business day to discuss your needs.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          {error}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="label-premium">Full Name *</label>
                          <input
                            id="name"
                            type="text"
                            className="input-premium"
                            {...register('name', { required: 'Name is required' })}
                          />
                          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="email" className="label-premium">Email *</label>
                          <input
                            id="email"
                            type="email"
                            className="input-premium"
                            {...register('email', {
                              required: 'Email is required',
                              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                            })}
                          />
                          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="phone" className="label-premium">Phone *</label>
                          <input
                            id="phone"
                            type="tel"
                            className="input-premium"
                            {...register('phone', { required: 'Phone is required' })}
                          />
                          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="clientType" className="label-premium">Client Type *</label>
                          <select
                            id="clientType"
                            className="input-premium"
                            {...register('clientType', { required: 'Please select' })}
                          >
                            <option value="">Select...</option>
                            <option value="individual">Individual</option>
                            <option value="sme">SME</option>
                            <option value="corporate">Corporate</option>
                          </select>
                          {errors.clientType && <p className="text-xs text-red-600 mt-1">{errors.clientType.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="helpWith" className="label-premium">What would you like help with?</label>
                        <select id="helpWith" className="input-premium" {...register('helpWith')}>
                          <option value="">Select...</option>
                          <option value="medical">Medical / Health Insurance</option>
                          <option value="motor">Motor / Vehicle Insurance</option>
                          <option value="life">Life Insurance</option>
                          <option value="property">Property / Assets</option>
                          <option value="liability">Liability</option>
                          <option value="business">Business / Commercial</option>
                          <option value="employee-benefits">Employee Benefits</option>
                          <option value="other">Other / Not Sure</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="existingInsurance" className="label-premium">Existing insurance?</label>
                          <select id="existingInsurance" className="input-premium" {...register('existingInsurance')}>
                            <option value="">Select...</option>
                            <option value="yes">Yes, I have existing cover</option>
                            <option value="no">No, I need new cover</option>
                            <option value="unsure">Not sure</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="renewalDate" className="label-premium">Renewal date (if applicable)</label>
                          <input id="renewalDate" type="date" className="input-premium" {...register('renewalDate')} />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className="label-premium">Briefly describe your needs</label>
                        <textarea
                          id="description"
                          rows={4}
                          className="input-premium resize-none"
                          placeholder="Tell us about your situation, what you want to protect, or any specific concerns..."
                          {...register('description')}
                        />
                      </div>

                      <div>
                        <label htmlFor="preferredContact" className="label-premium">Preferred contact method</label>
                        <select id="preferredContact" className="input-premium" {...register('preferredContact')}>
                          <option value="phone">Phone</option>
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Submit Enquiry
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
