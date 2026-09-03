import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import Logo from './Logo'
import { contact } from '@/lib/contact'
import { footerNav } from '@/lib/navigation'

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Logo variant="gold" size="xl" logoType="downname" />
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              An insurance solutions agency serving individuals, SMEs and corporate organisations. 
              We understand the risk first. The policy comes after.
            </p>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span>Est. 2020 · Nairobi, Kenya</span>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-6">
            <h4 className="font-serif text-lg font-medium text-white">Explore</h4>
            <ul className="space-y-3">
              {footerNav.explore.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-secondary transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Types */}
          <div className="space-y-6">
            <h4 className="font-serif text-lg font-medium text-white">Client Types</h4>
            <ul className="space-y-3">
              {footerNav.clientTypes.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-secondary transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-serif text-lg font-medium text-white pt-4">Legal</h4>
            <ul className="space-y-3">
              {footerNav.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-secondary transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-serif text-lg font-medium text-white">Contact</h4>
            <div className="space-y-4">
              <a
                href={`tel:${contact.phoneRaw}`}
                className="flex items-center gap-3 text-gray-300 hover:text-secondary transition-colors text-sm group"
              >
                <Phone className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
                {contact.phone}
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 text-gray-300 hover:text-secondary transition-colors text-sm group"
              >
                <Mail className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
                {contact.email}
              </a>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <MapPin className="w-4 h-4 text-secondary" />
                {contact.location}
              </div>
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-5 py-2.5 rounded-lg hover:bg-secondary hover:text-white transition-all duration-300 text-sm font-medium mt-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} GoldOak Insurance Solutions. All rights reserved.</p>
          <p className="text-xs text-gray-500 max-w-md text-center md:text-right">
            GoldOak is an insurance solutions agency. The content on this website is for general information 
            purposes and does not constitute professional insurance advice.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
