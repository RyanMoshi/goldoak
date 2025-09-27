import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Goldoak Insurance Agency - Your Trusted Insurance Partner in Kenya',
  description: 'Licensed insurance agency in Kenya helping individuals, families, SMEs, and corporates find the best insurance products. Cover your life journey with confidence.',
  keywords: 'insurance Kenya, medical insurance, life insurance, motor insurance, travel insurance, corporate insurance',
  authors: [{ name: 'Goldoak Insurance Agency' }],
  openGraph: {
    title: 'Goldoak Insurance Agency - Your Trusted Insurance Partner',
    description: 'Licensed insurance agency in Kenya helping you find the best insurance products.',
    type: 'website',
    locale: 'en_KE',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#004B87',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
