import ProductsHero from '@/components/ProductsHero'
import ProductsList from '@/components/ProductsList'
import ProductCategories from '@/components/ProductCategories'
import ProductCTA from '@/components/ProductCTA'

export const metadata = {
  title: 'Insurance Products - Goldoak Insurance Agency',
  description: 'Comprehensive insurance products including medical, life, motor, travel, home, education, corporate, and agricultural insurance in Kenya.',
}

export default function Products() {
  return (
    <div className="min-h-screen">
      <ProductsHero />
      <ProductCategories />
      <ProductsList />
      <ProductCTA />
    </div>
  )
}
