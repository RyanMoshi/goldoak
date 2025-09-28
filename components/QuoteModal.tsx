'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { X, Check, Download, Phone, Mail, User, FileText, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateInsurancePDF } from '@/lib/pdfGenerator'

interface QuoteFormData {
  // Personal Information
  fullName: string
  idNumber: string
  email: string
  phone: string
  county: string
  preferredContactMethod: string
  
  // Insurance Details
  insuranceType: string
  preferredInsurer: string
  coverageValue: string
  policyStartDate: string
  policyDuration: string
  currentInsurance: string
  
  // Additional Info
  additionalInfo: string
  prefersCall: boolean
  subscribeUpdates: boolean
  
  // File uploads
  idPhoto: FileList
  passportPhoto: FileList
  existingPolicyDocs: FileList
}

interface QuoteModalProps {
  isOpen: boolean
  onClose: () => void
}

const QuoteModal = ({ isOpen, onClose }: QuoteModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<QuoteFormData>()
  
  const insuranceTypes = [
    'Medical Insurance',
    'Life Insurance',
    'Motor Insurance',
    'Travel Insurance',
    'Home Insurance',
    'Education Plans',
    'Corporate Insurance',
    'Agricultural Insurance'
  ]

  const insurers = [
    'Jubilee Insurance',
    'Britam Holdings',
    'Old Mutual',
    'CIC Insurance',
    'AAR Insurance',
    'GA Insurance',
    'Heritage Insurance',
    'Madison Insurance',
    'APA Insurance',
    'UAP Insurance',
    'Sanlam Kenya',
    'First Assurance',
    'No Preference'
  ]

  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
    'Garissa', 'Kakamega', 'Nyeri', 'Meru', 'Machakos', 'Kitui', 'Embu', 'Isiolo',
    'Marsabit', 'Mandera', 'Wajir', 'Tana River', 'Lamu', 'Taita Taveta', 'Kilifi',
    'Kwale', 'Siaya', 'Kisii', 'Nyamira', 'Bomet', 'Kericho', 'Nandi',
    'Uasin Gishu', 'Trans Nzoia', 'West Pokot', 'Samburu', 'Laikipia',
    'Narok', 'Kajiado', 'Makueni', 'Kiambu', 'Murang\'a',
    'Kirinyaga', 'Tharaka Nithi'
  ]

  const contactMethods = [
    'Call',
    'Email',
    'WhatsApp'
  ]

  const policyDurations = [
    '1 Year',
    '2 Years',
    '3 Years',
    '5 Years',
    '10 Years',
    'Lifetime'
  ]

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true)
    
    try {
      // Upload files first and get URLs
      const uploadedFiles: { [key: string]: string | string[] } = {}
      
      // Upload ID Photo
      if (data.idPhoto && data.idPhoto.length > 0) {
        const idFormData = new FormData()
        idFormData.append('file', data.idPhoto[0])
        const idResponse = await fetch('/api/upload', {
          method: 'POST',
          body: idFormData,
        })
        const idResult = await idResponse.json()
        if (idResult.success) {
          uploadedFiles.idPhotoUrl = idResult.url
        }
      }
      
      // Upload Passport Photo
      if (data.passportPhoto && data.passportPhoto.length > 0) {
        const passportFormData = new FormData()
        passportFormData.append('file', data.passportPhoto[0])
        const passportResponse = await fetch('/api/upload', {
          method: 'POST',
          body: passportFormData,
        })
        const passportResult = await passportResponse.json()
        if (passportResult.success) {
          uploadedFiles.passportPhotoUrl = passportResult.url
        }
      }
      
      // Upload existing policy documents
      if (data.existingPolicyDocs && data.existingPolicyDocs.length > 0) {
        const policyUrls: string[] = []
        for (let i = 0; i < data.existingPolicyDocs.length; i++) {
          const policyFormData = new FormData()
          policyFormData.append('file', data.existingPolicyDocs[i])
          const policyResponse = await fetch('/api/upload', {
            method: 'POST',
            body: policyFormData,
          })
          const policyResult = await policyResponse.json()
          if (policyResult.success) {
            policyUrls.push(policyResult.url)
          }
        }
        uploadedFiles.existingPolicyDocsUrls = policyUrls
      }
      
      // Prepare form data for contact API
      const contactData = {
        ...data,
        type: 'quote_request',
        ...uploadedFiles
      }
      
      console.log('QuoteModal - Sending data:', contactData)
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      })

      console.log('QuoteModal - Response status:', response.status)
      console.log('QuoteModal - Response ok:', response.ok)
      
      if (response.ok) {
        const result = await response.json()
        console.log('QuoteModal - Success response:', result)
        toast.success('Quote request submitted successfully! We\'ll contact you within 2 hours.')
        reset()
        onClose()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('QuoteModal - Server error response:', errorData)
        throw new Error(`Server error: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      toast.error('Failed to submit quote request. Please try again.')
      console.error('Quote submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrintPDF = () => {
    const formData = watch()
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Please fill in the required fields first')
      return
    }
    
    try {
      const pdfData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        idNumber: formData.idNumber || '',
        county: formData.county || '',
        preferredContactMethod: formData.preferredContactMethod || '',
        insuranceType: formData.insuranceType || '',
        preferredInsurer: formData.preferredInsurer || '',
        coverageValue: formData.coverageValue || '',
        policyStartDate: formData.policyStartDate || '',
        policyDuration: formData.policyDuration || '',
        currentInsurance: formData.currentInsurance || '',
        numberOfPeople: 1,
        businessName: '',
        budgetRange: '',
        currentInsurer: '',
        coverageStartDate: '',
        notes: formData.additionalInfo || '',
        additionalInfo: formData.additionalInfo || '',
        prefersCall: formData.prefersCall || false,
        subscribeUpdates: formData.subscribeUpdates || false,
        experienceChoice: 'self',
        idPhotoUrl: '',
        passportPhotoUrl: '',
        existingPolicyDocsUrls: []
      }
      
      const pdf = generateInsurancePDF(pdfData)
      pdf.save(`insurance-quote-${formData.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      toast.error('Failed to generate PDF')
      console.error('PDF generation error:', error)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-primary text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Get a Quote</h2>
                <p className="text-white/90 mt-1">Get quotes from multiple insurance providers</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('fullName', { required: 'Full name is required' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                {/* ID Number */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    ID Number *
                  </label>
                  <input
                    {...register('idNumber', { required: 'ID number is required' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    placeholder="12345678"
                  />
                  {errors.idNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.idNumber.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Email Address *
                  </label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Phone Number *
                  </label>
                  <input
                    {...register('phone', { required: 'Phone number is required' })}
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    placeholder="+254 700 000 000"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* County */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    County / Residence *
                  </label>
                  <select
                    {...register('county', { required: 'County is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  >
                    <option value="">Select your county</option>
                    {counties.map(county => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                  {errors.county && (
                    <p className="text-red-500 text-sm mt-1">{errors.county.message}</p>
                  )}
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Preferred Contact Method *
                  </label>
                  <select
                    {...register('preferredContactMethod', { required: 'Please select preferred contact method' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  >
                    <option value="">Select contact method</option>
                    {contactMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                  {errors.preferredContactMethod && (
                    <p className="text-red-500 text-sm mt-1">{errors.preferredContactMethod.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Insurance Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Insurance Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type of Insurance */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Type of Insurance *
                  </label>
                  <select
                    {...register('insuranceType', { required: 'Please select an insurance type' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  >
                    <option value="">Select insurance type</option>
                    {insuranceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.insuranceType && (
                    <p className="text-red-500 text-sm mt-1">{errors.insuranceType.message}</p>
                  )}
                </div>

                {/* Preferred Insurer */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Preferred Insurer
                  </label>
                  <select
                    {...register('preferredInsurer')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  >
                    <option value="">Select preferred insurer</option>
                    {insurers.map(insurer => (
                      <option key={insurer} value={insurer}>{insurer}</option>
                    ))}
                  </select>
                </div>

                {/* Coverage Value */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Coverage Value / Sum Insured
                  </label>
                  <input
                    {...register('coverageValue')}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    placeholder="e.g., KES 1,000,000"
                  />
                </div>

                {/* Policy Start Date */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Desired Policy Start Date
                  </label>
                  <input
                    {...register('policyStartDate')}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  />
                </div>

                {/* Policy Duration */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Duration of Policy
                  </label>
                  <select
                    {...register('policyDuration')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  >
                    <option value="">Select duration</option>
                    {policyDurations.map(duration => (
                      <option key={duration} value={duration}>{duration}</option>
                    ))}
                  </select>
                </div>

                {/* Current Insurance */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Do you currently have insurance?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        {...register('currentInsurance')}
                        type="radio"
                        value="yes"
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-text-body">Yes</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        {...register('currentInsurance')}
                        type="radio"
                        value="no"
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-text-body">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* File Uploads Section */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Required Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ID Photo */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Upload ID Photo *
                  </label>
                  <input
                    {...register('idPhoto', { required: 'ID photo is required' })}
                    type="file"
                    accept="image/*,application/pdf"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  />
                  {errors.idPhoto && (
                    <p className="text-red-500 text-sm mt-1">{errors.idPhoto.message}</p>
                  )}
                </div>

                {/* Passport Photo */}
                <div>
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Upload Passport Photo *
                  </label>
                  <input
                    {...register('passportPhoto', { required: 'Passport photo is required' })}
                    type="file"
                    accept="image/*,application/pdf"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  />
                  {errors.passportPhoto && (
                    <p className="text-red-500 text-sm mt-1">{errors.passportPhoto.message}</p>
                  )}
                </div>

                {/* Existing Policy Documents */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-body mb-2">
                    Existing Policy Documents (Optional)
                  </label>
                  <input
                    {...register('existingPolicyDocs')}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-sm font-medium text-text-body mb-2">
                Additional Information
              </label>
              <textarea
                {...register('additionalInfo')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 resize-none"
                placeholder="Tell us more about your insurance needs..."
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  {...register('prefersCall')}
                  type="checkbox"
                  id="prefersCall"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="prefersCall" className="text-sm font-medium text-text-body">
                  I prefer to book a call instead
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  {...register('subscribeUpdates')}
                  type="checkbox"
                  id="subscribeUpdates"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="subscribeUpdates" className="text-sm font-medium text-text-body">
                  Subscribe me to updates and policy reminders
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Submit Application
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handlePrintPDF}
                className="flex-1 bg-secondary text-primary px-8 py-4 rounded-xl font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Print Branded PDF
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="bg-bg-section rounded-xl p-4 mt-6">
              <div className="flex items-center justify-center space-x-6 text-sm text-text-body">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>No Obligation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>2 Hour Response</span>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default QuoteModal
