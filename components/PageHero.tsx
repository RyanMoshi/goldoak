import Breadcrumbs from './Breadcrumbs'

interface PageHeroProps {
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; href?: string }[]
  light?: boolean
  children?: React.ReactNode
}

export default function PageHero({
  title,
  subtitle,
  breadcrumbs,
  light = false,
  children,
}: PageHeroProps) {
  return (
    <section
      className={`relative py-20 md:py-28 ${
        light ? 'bg-section-cream' : 'hero-gradient-navy'
      }`}
    >
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {breadcrumbs && (
          <div className={light ? '' : '[&_*]:!text-gray-300 [&_a]:!text-gray-300 [&_a:hover]:!text-white [&_span]:!text-white'}>
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        <div className="max-w-3xl">
          <h1
            className={`font-serif text-display font-medium ${
              light ? 'text-text-headline' : 'text-white'
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`mt-6 text-body-lg ${
                light ? 'text-text-body' : 'text-gray-300'
              } max-w-2xl`}
            >
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  )
}
