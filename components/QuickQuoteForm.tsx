'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, Shield, Car, Home, Heart, Plane } from 'lucide-react'
import Link from 'next/link'

const QuickQuoteForm = () => {
  const [selectedType, setSelectedType] = useState('')
  const [carModel, setCarModel] = useState('')
  const [location, setLocation] = useState('')

  const insuranceTypes = [
    { id: 'motor', name: 'Motor Insurance', icon: Car, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'medical', name: 'Medical Insurance', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 'home', name: 'Home Insurance', icon: Home, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'travel', name: 'Travel Insurance', icon: Plane, color: 'text-purple-600', bgColor: 'bg-purple-50' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirect to full quote form with pre-filled data
    const params = new URLSearchParams({
      type: selectedType,
      model: carModel,
      location: location
    })
    window.location.href = `/quote?${params.toString()}`
  }

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Get Your <span className="text-gradient">Free Quote</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare quotes from Kenya's top insurance companies in just 30 seconds. 
            Save up to 40% on your premiums.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Insurance Type Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  What type of insurance do you need?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {insuranceTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        selectedType === type.id
                          ? 'border-primary bg-primary/5 shadow-lg'
                          : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-12 h-12 ${type.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <type.icon className={`w-6 h-6 ${type.color}`} />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{type.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Car Model Input (only show for motor insurance) */}
              {selectedType === 'motor' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    What's your car model?
                  </label>
                  <input
                    type="text"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    placeholder="e.g., Toyota Corolla, Honda Civic"
                    className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </motion.div>
              )}

              {/* Location Input */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Where are you located?
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select your location</option>
                  <option value="nairobi">Nairobi</option>
                  <option value="mombasa">Mombasa</option>
                  <option value="kisumu">Kisumu</option>
                  <option value="nakuru">Nakuru</option>
                  <option value="eldoret">Eldoret</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={!selectedType || !location}
                  className="btn-primary text-xl px-12 py-5 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center group"
                >
                  <Shield className="w-6 h-6 mr-3" />
                  Get My Free Quote
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-sm text-gray-500 mt-4">
                  ✓ 100% Free • ✓ No Obligation • ✓ Compare 12+ Insurers
                </p>
              </div>
            </form>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900">Licensed & Regulated</h3>
              <p className="text-sm text-gray-600">IRA Kenya Certified</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto">
                <ArrowRight className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-gray-900">Instant Quotes</h3>
              <p className="text-sm text-gray-600">Get results in minutes</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">100% Free</h3>
              <p className="text-sm text-gray-600">No hidden fees</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default QuickQuoteForm
