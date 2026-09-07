export const contact = {
  phone: '+254 729 911 311',
  phoneRaw: '+254729911311',
  email: 'info@goldoak.co.ke',
  whatsapp: 'https://wa.me/254729911311',
  location: 'Nairobi, Kenya',
  /** The Super Agent WhatsApp line. Digits are used only to build wa.me links and are never displayed. */
  superAgentWhatsApp: (process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER ?? '255742473493').replace(/\D/g, ''),
  hours: {
    weekday: 'Mon – Fri: 8:00 AM – 6:00 PM',
    saturday: 'Sat: 9:00 AM – 4:00 PM',
    sunday: 'Sun: Closed',
    emergency: 'Emergency: 24/7',
  },
  social: {
    facebook: '',
    twitter: '',
    linkedin: '',
  },
} as const

/** A wa.me link that opens the Super Agent chat with a pre-filled message. */
export function superAgentLink(text = 'MENU'): string {
  return `https://wa.me/${contact.superAgentWhatsApp}?text=${encodeURIComponent(text)}`
}
