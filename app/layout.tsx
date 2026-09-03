import type { Metadata } from 'next'
import { Petrona, Karla } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

const petrona = Petrona({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-petrona',
  display: 'swap',
})

const karla = Karla({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-karla',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'GoldOak Insurance Solutions — Risk First, Policy After',
    template: '%s | GoldOak Insurance Solutions',
  },
  description:
    'GoldOak is an insurance solutions agency in Kenya. We understand your risk first, compare suitable options from a panel of insurers, and stay with you through service, claims, and renewal.',
  keywords: [
    'insurance solutions Kenya',
    'insurance advisory Kenya',
    'SME insurance Kenya',
    'corporate insurance Kenya',
    'individual insurance Kenya',
    'insurance broker Nairobi',
    'risk management Kenya',
    'claims support Kenya',
  ],
  authors: [{ name: 'GoldOak Insurance Solutions' }],
  creator: 'GoldOak Insurance Solutions',
  icons: {
    icon: '/assets/Gold Icon.png',
    shortcut: '/assets/Gold Icon.png',
    apple: '/assets/Gold Icon.png',
  },
  openGraph: {
    title: 'GoldOak Insurance Solutions — Risk First, Policy After',
    description:
      'Insurance solutions agency in Kenya. We understand your risk first, compare suitable options, and stay with you through service, claims, and renewal.',
    type: 'website',
    locale: 'en_KE',
    siteName: 'GoldOak Insurance Solutions',
    images: [
      {
        url: '/assets/Gold Downname logo.png',
        width: 1200,
        height: 630,
        alt: 'GoldOak Insurance Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoldOak Insurance Solutions — Risk First, Policy After',
    description:
      'Insurance solutions agency in Kenya. Understand the risk first. The policy comes after.',
    images: ['/assets/Gold Downname logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${petrona.variable} ${karla.variable}`}>
      <body className="font-sans antialiased">
        <Navigation />
        <main id="main-content">{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#004B87',
              color: '#fff',
              fontFamily: 'Karla, sans-serif',
            },
          }}
        />
      </body>
    </html>
  )
}
