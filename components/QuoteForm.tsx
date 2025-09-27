'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { ChevronLeft, ChevronRight, Check, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  {...register('phone', { required: 'Phone number is required' })}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+254 700 000 000"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">National ID / Passport *</label>
                <input
                  {...register('idNumber', { required: 'ID number is required' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="12345678"
                />
                {errors.idNumber && <p className="text-red-500 text-sm mt-1">{errors.idNumber.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">County / Location *</label>
                <select
                  {...register('county', { required: 'County is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name (if Corporate)</label>
                <input
                  {...register('businessName')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your business name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Insurance Company</label>
                <select
                  {...register('preferredInsurer')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Current insurance company"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">When do you want coverage to begin?</label>
                <input
                  {...register('coverageStartDate')}
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Progress Bar */}
            <div className="bg-primary/5 px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Get Your Quote</h1>
                <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
              </div>
              
              <div className="flex space-x-2">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-2 rounded-full ${
                      index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex justify-between mt-2">
                {steps.map((step, index) => (
                  <span
                    key={index}
                    className={`text-xs ${
                      index <= currentStep ? 'text-primary font-medium' : 'text-gray-500'
                    }`}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentStep === steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    className="btn-primary"
                  >
                    Submit Quote Request
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuoteForm
