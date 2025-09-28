import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'GoldOak Insurance Agency - Your Trusted Insurance Partner in Kenya',
  description: 'Licensed insurance agency in Kenya helping individuals, families, SMEs, and corporates find the best insurance products. Cover your life journey with confidence.',
  keywords: 'insurance Kenya, medical insurance, life insurance, motor insurance, travel insurance, corporate insurance',
  authors: [{ name: 'GoldOak Insurance Agency' }],
  icons: {
    icon: '/assets/Gold Icon.png',
    shortcut: '/assets/Gold Icon.png',
    apple: '/assets/Gold Icon.png',
  },
  openGraph: {
    title: 'GoldOak Insurance Agency - Your Trusted Insurance Partner',
    description: 'Licensed insurance agency in Kenya helping you find the best insurance products.',
    type: 'website',
    locale: 'en_KE',
    siteName: 'GoldOak Insurance Agency',
    images: [
      {
        url: '/assets/Gold Downname logo.png',
        width: 1200,
        height: 630,
        alt: 'GoldOak Insurance Agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoldOak Insurance Agency - Your Trusted Insurance Partner',
    description: 'Licensed insurance agency in Kenya helping you find the best insurance products.',
    images: ['/assets/Gold Downname logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#003220',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
