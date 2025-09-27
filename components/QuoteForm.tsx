'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { ChevronLeft, ChevronRight, Check, Upload, X, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateInsurancePDF } from '@/lib/pdfGenerator'

interface FormData {
  // Personal Information
  fullName: string
  email: string
  phone: string
  idNumber: string
  county: string
  
  // Insurance Details
  insuranceType: string[]
  numberOfPeople: number
  businessName: string
  preferredInsurer: string
  budgetRange: string
  
  // Additional Info
  currentInsurance: string
  currentInsurer: string
  coverageStartDate: string
  notes: string
  files: FileList
  
  // Experience Choice
  experienceChoice: 'self' | 'advisor'
}

const QuoteForm = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [experienceChoice, setExperienceChoice] = useState<'self' | 'advisor' | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>()
  
  const steps = [
    'Choose Experience',
    'Personal Information',
    'Insurance Details',
    'Additional Information',
    'Review & Submit'
  ]

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
    'First Assurance'
  ]

  const budgetRanges = [
    'Under KES 10,000/year',
    'KES 10,000 - 25,000/year',
    'KES 25,000 - 50,000/year',
    'KES 50,000 - 100,000/year',
    'KES 100,000 - 250,000/year',
    'Over KES 250,000/year'
  ]

  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
    'Garissa', 'Kakamega', 'Nyeri', 'Meru', 'Machakos', 'Kitui', 'Embu', 'Isiolo',
    'Marsabit', 'Mandera', 'Wajir', 'Tana River', 'Lamu', 'Taita Taveta', 'Kilifi',
    'Kwale', 'Mombasa', 'Siaya', 'Kisii', 'Nyamira', 'Bomet', 'Kericho', 'Nandi',
    'Uasin Gishu', 'Trans Nzoia', 'West Pokot', 'Samburu', 'Laikipia', 'Nakuru',
    'Narok', 'Kajiado', 'Makueni', 'Kitui', 'Machakos', 'Kiambu', 'Murang\'a',
    'Nyeri', 'Kirinyaga', 'Embu', 'Tharaka Nithi', 'Meru', 'Isiolo', 'Marsabit'
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData()
      
      // Add all form data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'files') return // Handle files separately
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
      })
      
      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })
      
      formData.append('experienceChoice', experienceChoice || 'self')
      
      const response = await fetch('/api/send-form', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        toast.success('Quote request submitted successfully! We\'ll contact you within 2 hours.')
        
        // Generate and download PDF
        const pdf = generateInsurancePDF({
          ...data,
          experienceChoice: experienceChoice || 'self'
        })
        pdf.save(`insurance-application-${data.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
        
        // Reset form
        setCurrentStep(0)
        setExperienceChoice(null)
        setUploadedFiles([])
      } else {
        throw new Error('Failed to submit form')
      }
    } catch (error) {
      toast.error('Failed to submit quote request. Please try again.')
      console.error('Form submission error:', error)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How would you like to proceed?</h2>
              <p className="text-gray-600">Choose your preferred way to get your insurance quote.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setExperienceChoice('self')
                  setValue('experienceChoice', 'self')
                  nextStep()
                }}
                className="p-8 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300 text-left"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Fill the form myself</h3>
                  <p className="text-gray-600">Complete our detailed form to get quotes from multiple insurers</p>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setExperienceChoice('advisor')
                  setValue('experienceChoice', 'advisor')
                  nextStep()
                }}
                className="p-8 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300 text-left"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Get assistance from an advisor</h3>
                  <p className="text-gray-600">Let our experts help you find the perfect insurance solution</p>
                </div>
              </motion.button>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Personal Information</h2>
              <p className="text-gray-600">Tell us about yourself so we can provide the best quotes.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  {...register('fullName', { required: 'Full name is required' })}
                  type="text"
                  className="input-premium"
                  placeholder="Enter your full name"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="input-premium"
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  {...register('phone', { required: 'Phone number is required' })}
                  type="tel"
                  className="input-premium"
                  placeholder="+254 700 000 000"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">National ID / Passport *</label>
                <input
                  {...register('idNumber', { required: 'ID number is required' })}
                  type="text"
                  className="input-premium"
                  placeholder="12345678"
                />
                {errors.idNumber && <p className="text-red-500 text-sm mt-1">{errors.idNumber.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">County / Location *</label>
                <select
                  {...register('county', { required: 'County is required' })}
                  className="input-premium"
                >
                  <option value="">Select your county</option>
                  {counties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
                {errors.county && <p className="text-red-500 text-sm mt-1">{errors.county.message}</p>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Insurance Details</h2>
              <p className="text-gray-600">What type of insurance are you looking for?</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Type of Insurance Needed *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {insuranceTypes.map(type => (
                  <label key={type} className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-primary/5 cursor-pointer">
                    <input
                      {...register('insuranceType', { required: 'Please select at least one insurance type' })}
                      type="checkbox"
                      value={type}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
              {errors.insuranceType && <p className="text-red-500 text-sm mt-1">{errors.insuranceType.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of People to be Covered</label>
                <input
                  {...register('numberOfPeople', { min: 1 })}
                  type="number"
                  min="1"
                  className="input-premium"
                  placeholder="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name (if Corporate)</label>
                <input
                  {...register('businessName')}
                  type="text"
                  className="input-premium"
                  placeholder="Your business name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Insurance Company</label>
                <select
                  {...register('preferredInsurer')}
                  className="input-premium"
                >
                  <option value="">No preference</option>
                  {insurers.map(insurer => (
                    <option key={insurer} value={insurer}>{insurer}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                <select
                  {...register('budgetRange')}
                  className="input-premium"
                >
                  <option value="">Select budget range</option>
                  {budgetRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Information</h2>
              <p className="text-gray-600">Help us provide you with the most accurate quotes.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Do you currently have insurance?</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      {...register('currentInsurance')}
                      type="radio"
                      value="yes"
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      {...register('currentInsurance')}
                      type="radio"
                      value="no"
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">No</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Insurer (if applicable)</label>
                <input
                  {...register('currentInsurer')}
                  type="text"
                  className="input-premium"
                  placeholder="Current insurance company"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">When do you want coverage to begin?</label>
                <input
                  {...register('coverageStartDate')}
                  type="date"
                  className="input-premium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB each</p>
                  </label>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes / Special Requests</label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="input-premium"
                  placeholder="Any additional information or special requirements..."
                />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Review Your Information</h2>
              <p className="text-gray-600">Please review your information before submitting.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                <p className="text-sm text-gray-600">Name: {watch('fullName')}</p>
                <p className="text-sm text-gray-600">Email: {watch('email')}</p>
                <p className="text-sm text-gray-600">Phone: {watch('phone')}</p>
                <p className="text-sm text-gray-600">County: {watch('county')}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Insurance Details</h3>
                <p className="text-sm text-gray-600">Types: {watch('insuranceType')?.join(', ')}</p>
                <p className="text-sm text-gray-600">People to cover: {watch('numberOfPeople')}</p>
                <p className="text-sm text-gray-600">Budget: {watch('budgetRange')}</p>
                <p className="text-sm text-gray-600">Preferred insurer: {watch('preferredInsurer') || 'No preference'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Additional Information</h3>
                <p className="text-sm text-gray-600">Current insurance: {watch('currentInsurance') || 'Not specified'}</p>
                <p className="text-sm text-gray-600">Coverage start: {watch('coverageStartDate') || 'Not specified'}</p>
                <p className="text-sm text-gray-600">Files uploaded: {uploadedFiles.length}</p>
                {watch('notes') && <p className="text-sm text-gray-600">Notes: {watch('notes')}</p>}
              </div>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h3 className="font-semibold text-primary mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• We'll review your information and contact you within 2 hours</li>
                <li>• You'll receive quotes from multiple insurance companies</li>
                <li>• Our team will help you compare and choose the best option</li>
                <li>• No obligation to purchase - completely free service</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Get Your <span className="text-gradient">Insurance Quote</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fill out our simple form and get quotes from multiple insurance providers in minutes. 
              No obligation, completely free.
            </p>
          </div>

          <div className="card-premium overflow-hidden">
            {/* Premium Progress Bar */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-8 py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Application Progress</h2>
                  <p className="text-gray-600">Step {currentStep + 1} of {steps.length}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{Math.round(((currentStep + 1) / steps.length) * 100)}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
              
              {/* Progress Steps */}
              <div className="relative">
                <div className="flex justify-between">
                  {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        index <= currentStep 
                          ? 'bg-primary text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index < currentStep ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`text-xs mt-2 text-center max-w-20 ${
                        index <= currentStep ? 'text-primary font-medium' : 'text-gray-500'
                      }`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 -z-10">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 lg:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2 px-8 py-4 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-medium">Previous</span>
                </button>

                {currentStep === steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    className="btn-primary text-lg px-12 py-4"
                  >
                    Submit Quote Request
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Next Step
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900">Secure & Private</h3>
              <p className="text-sm text-gray-600">Your information is encrypted and secure</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-gray-900">Quick Response</h3>
              <p className="text-sm text-gray-600">Get quotes within 2 hours</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900">No Obligation</h3>
              <p className="text-sm text-gray-600">Free service with no commitment</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuoteForm
