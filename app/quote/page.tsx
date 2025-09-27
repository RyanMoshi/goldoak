import QuoteHero from '@/components/QuoteHero'
import QuoteForm from '@/components/QuoteForm'

export const metadata = {
  title: 'Get Insurance Quote - Goldoak Insurance Agency',
  description: 'Get a free insurance quote from multiple insurers. Compare rates and coverage options for medical, life, motor, travel, and other insurance products.',
}

export default function Quote() {
  return (
    <div className="min-h-screen">
      <QuoteHero />
      <QuoteForm />
    </div>
  )
}
