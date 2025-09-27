import ContactHero from '@/components/ContactHero'
import ContactInfo from '@/components/ContactInfo'
import ContactForm from '@/components/ContactForm'
import ContactMap from '@/components/ContactMap'

export const metadata = {
  title: 'Contact Us - Goldoak Insurance Agency',
  description: 'Get in touch with Goldoak Insurance Agency. Call +254 729 911 311, WhatsApp, or email info@goldoak.co.ke for insurance quotes and assistance.',
}

export default function Contact() {
  return (
    <div className="min-h-screen">
      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <ContactMap />
    </div>
  )
}
