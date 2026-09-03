import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-serif font-bold text-secondary mb-4">404</p>
        <h1 className="font-serif text-heading-2 font-medium text-text-headline mb-4">
          Page not found
        </h1>
        <p className="text-body text-text-body mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          Go back home
        </Link>
      </div>
    </div>
  )
}
