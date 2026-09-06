import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

/** Marketing site chrome. The platform routes (/signin, /agency, /portal) have their own shells. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  )
}
