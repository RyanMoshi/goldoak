import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle, Facebook, Twitter, Linkedin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Goldoak Insurance</h3>
                <p className="text-sm text-gray-300">Agency Limited</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Licensed insurance agency in Kenya, regulated by the Insurance Regulatory Authority. 
              We help you transfer unforeseen risks to dependable insurance partners.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-secondary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-secondary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-secondary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-secondary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-gray-300 hover:text-secondary transition-colors text-sm">
                  Our Partners
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-secondary transition-colors text-sm">
                  Insurance Products
                </Link>
              </li>
              <li>
                <Link href="/quote" className="text-gray-300 hover:text-secondary transition-colors text-sm">
                  Get Quote
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-secondary transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Insurance Products */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Insurance Products</h4>
            <ul className="space-y-2">
              <li className="text-gray-300 text-sm">Medical Insurance</li>
              <li className="text-gray-300 text-sm">Life Insurance</li>
              <li className="text-gray-300 text-sm">Motor Insurance</li>
              <li className="text-gray-300 text-sm">Travel Insurance</li>
              <li className="text-gray-300 text-sm">Home Insurance</li>
              <li className="text-gray-300 text-sm">Corporate Insurance</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <p className="text-gray-300 text-sm">+254 729 911 311</p>
                  <p className="text-gray-400 text-xs">Call us anytime</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <p className="text-gray-300 text-sm">info@goldoak.co.ke</p>
                  <p className="text-gray-400 text-xs">Email us</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <p className="text-gray-300 text-sm">Nairobi, Kenya</p>
                  <p className="text-gray-400 text-xs">Licensed in Kenya</p>
                </div>
              </div>
              <a
                href="https://wa.me/254729911311"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-300 text-sm">
              © 2024 Goldoak Insurance Agency Limited. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-300 hover:text-secondary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-secondary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
