import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle, Facebook, Twitter, Linkedin, Award, Shield, Clock } from 'lucide-react'
import Logo from './Logo'

const Footer = () => {
  return (
    <footer className="bg-primary text-white">

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <Logo variant="gold" size="lg" showText={true} textColor="text-white" />
            <p className="text-gray-200 text-base leading-relaxed">
              Licensed insurance agency in Kenya, regulated by the Insurance Regulatory Authority. 
              We help you transfer unforeseen risks to dependable insurance partners.
            </p>
            
            {/* Trust Badges */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-secondary" />
                <span className="text-sm text-gray-200">IRA Licensed & Regulated</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-secondary" />
                <span className="text-sm text-gray-200">10,000+ Happy Clients</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-secondary" />
                <span className="text-sm text-gray-200">24/7 Customer Support</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-200 hover:text-secondary transition-colors text-base flex items-center group">
                  <span className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-200 hover:text-secondary transition-colors text-base flex items-center group">
                  <span className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-gray-200 hover:text-secondary transition-colors text-base flex items-center group">
                  <span className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Our Partners
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-200 hover:text-secondary transition-colors text-base flex items-center group">
                  <span className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Insurance Products
                </Link>
              </li>
              <li>
                <Link href="/quote" className="text-gray-200 hover:text-secondary transition-colors text-base flex items-center group">
                  <span className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Get Quote
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-200 hover:text-secondary transition-colors text-base flex items-center group">
                  <span className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Insurance Products */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-white">Insurance Products</h4>
            <ul className="space-y-3">
              <li className="text-gray-200 text-base flex items-center group">
                <span className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Medical Insurance
              </li>
              <li className="text-gray-200 text-base flex items-center group">
                <span className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Life Insurance
              </li>
              <li className="text-gray-200 text-base flex items-center group">
                <span className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Motor Insurance
              </li>
              <li className="text-gray-200 text-base flex items-center group">
                <span className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Travel Insurance
              </li>
              <li className="text-gray-200 text-base flex items-center group">
                <span className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Home Insurance
              </li>
              <li className="text-gray-200 text-base flex items-center group">
                <span className="w-2 h-2 bg-secondary rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Corporate Insurance
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-white">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <Phone className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-gray-200 text-base font-medium">+254 729 911 311</p>
                  <p className="text-gray-400 text-sm">Call us anytime</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <Mail className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-gray-200 text-base font-medium">info@goldoak.co.ke</p>
                  <p className="text-gray-400 text-sm">Email us</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-gray-200 text-base font-medium">Nairobi, Kenya</p>
                  <p className="text-gray-400 text-sm">Licensed in Kenya</p>
                </div>
              </div>
              
              <a
                href="https://wa.me/254729911311"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 bg-secondary text-white px-6 py-3 rounded-xl hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>


        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-300 text-sm">
              © 2024 Goldoak Insurance Agency Limited. All rights reserved.
            </p>
            <div className="flex space-x-8 text-sm">
              <Link href="/privacy" className="text-gray-300 hover:text-secondary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-secondary transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-gray-300 hover:text-secondary transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
