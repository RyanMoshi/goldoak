import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield, Car, Clock, CheckCircle, FileText, Phone, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Motor Insurance - GoldOak Insurance Agency',
  description: 'Comprehensive motor insurance coverage for individuals, businesses, and PSV operators in Kenya. Get quotes for comprehensive, third-party, and commercial vehicle insurance.',
  keywords: 'motor insurance Kenya, vehicle insurance, comprehensive cover, third party insurance, PSV insurance, commercial fleet insurance',
}

export default function MotorInsurancePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <Link 
              href="/products" 
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Insurance Products
            </Link>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Motor Insurance</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Comprehensive and third-party vehicle insurance options for individuals, businesses, and PSV operators across Kenya.
            </p>
          </div>
        </div>
      </div>

      {/* Coverage Options */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Coverage Options</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the right level of protection for your vehicle and driving needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Comprehensive Cover */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Comprehensive Vehicle Cover</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Accident damage protection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Theft and fire coverage</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Third-party liability</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>24/7 roadside assistance</span>
                  </li>
                </ul>
              </div>

              {/* Third Party Only */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                  <Car className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Third-Party Only (TPO)</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Third-party liability coverage</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Property damage protection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Bodily injury coverage</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Affordable premiums</span>
                  </li>
                </ul>
              </div>

              {/* PSV Insurance */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">PSV Insurance</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Public Service Vehicle coverage</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Passenger liability</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Commercial vehicle protection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Fleet management support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Requirements</h2>
              <p className="text-xl text-gray-600">
                Documents needed to process your motor insurance application.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Essential Documents</h3>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <FileText className="w-5 h-5 text-primary mr-3" />
                    <span>Vehicle Logbook Copy</span>
                  </li>
                  <li className="flex items-center">
                    <FileText className="w-5 h-5 text-primary mr-3" />
                    <span>Valid Driver's License</span>
                  </li>
                  <li className="flex items-center">
                    <FileText className="w-5 h-5 text-primary mr-3" />
                    <span>Vehicle Valuation Report</span>
                  </li>
                  <li className="flex items-center">
                    <FileText className="w-5 h-5 text-primary mr-3" />
                    <span>National ID or Company PIN</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Additional Benefits</h3>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <Clock className="w-5 h-5 text-green-500 mr-3" />
                    <span>24/7 Roadside Assistance</span>
                  </li>
                  <li className="flex items-center">
                    <Clock className="w-5 h-5 text-green-500 mr-3" />
                    <span>Fast Claims Processing</span>
                  </li>
                  <li className="flex items-center">
                    <Clock className="w-5 h-5 text-green-500 mr-3" />
                    <span>Competitive Premiums</span>
                  </li>
                  <li className="flex items-center">
                    <Clock className="w-5 h-5 text-green-500 mr-3" />
                    <span>Expert Claims Support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Protect Your Vehicle?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Get a personalized quote for your motor insurance in minutes. No obligation, completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quote"
                className="bg-secondary text-primary px-8 py-4 rounded-xl font-semibold hover:bg-secondary/90 transition-colors inline-flex items-center justify-center"
              >
                Get a Quote Now
              </Link>
              <a
                href="tel:+254729911311"
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-colors inline-flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call +254 729 911 311
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
