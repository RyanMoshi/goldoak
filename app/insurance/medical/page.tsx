import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Heart, Users, Shield, CheckCircle, Clock, Phone, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Medical Insurance - GoldOak Insurance Agency',
  description: 'Comprehensive medical insurance coverage for individuals, families, and groups in Kenya. Access quality healthcare with our network of hospitals and clinics.',
  keywords: 'medical insurance Kenya, health insurance, family medical cover, group medical insurance, hospital cash plans',
}

export default function MedicalInsurancePage() {
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
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Medical Insurance</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Comprehensive health insurance coverage for individuals, families, and groups. Access quality healthcare when you need it most.
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
                Choose the right medical insurance plan for your health and budget needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Individual Cover */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Individual Medical Cover</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Inpatient and outpatient care</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Emergency medical treatment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Maternity and child care</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Prescription drug coverage</span>
                  </li>
                </ul>
              </div>

              {/* Family Cover */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Family Medical Cover</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Coverage for spouse and children</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Preventive care services</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Dental and optical benefits</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Mental health support</span>
                  </li>
                </ul>
              </div>

              {/* Group Cover */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Group Medical Cover</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Corporate employee benefits</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Customizable coverage levels</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Wellness programs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Dedicated account management</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Why Choose Our Medical Insurance?</h2>
              <p className="text-xl text-gray-600">
                Comprehensive coverage with access to Kenya's leading healthcare providers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Network Benefits</h3>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <Clock className="w-5 h-5 text-green-500 mr-3" />
                    <span>Access to 500+ hospitals nationwide</span>
                  </li>
                  <li className="flex items-center">
                    <Clock className="w-5 h-5 text-green-500 mr-3" />
                    <span>Cashless treatment at network facilities</span>
                  </li>
                  <li className="flex items-center">
                    <Clock className="w-5 h-5 text-green-500 mr-3" />
                    <span>24/7 emergency helpline</span>
                  </li>
                  <li className="flex items-center">
                    <Clock className="w-5 h-5 text-green-500 mr-3" />
                    <span>Second medical opinion service</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Coverage Features</h3>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>No waiting periods for accidents</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Maternity cover from day one</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Chronic disease management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Annual health check-ups</span>
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
              Protect Your Health Today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Get a personalized medical insurance quote and secure your family's health future.
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
