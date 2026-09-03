interface SectionHeaderProps {
  title: string
  subtitle?: string
  centered?: boolean
  light?: boolean
  className?: string
}

export default function SectionHeader({
  title,
  subtitle,
  centered = false,
  light = false,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`mb-12 md:mb-16 ${centered ? 'text-center' : ''} ${className}`}>
      <div className={`flex items-center gap-4 mb-4 ${centered ? 'justify-center' : ''}`}>
        <div className="h-px w-12 bg-secondary/50" />
        <span className="text-sm font-medium tracking-wider uppercase text-secondary">
          GoldOak
        </span>
        <div className="h-px w-12 bg-secondary/50" />
      </div>
      <h2
        className={`font-serif text-heading-2 font-medium ${
          light ? 'text-white' : 'text-text-headline'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-body-lg max-w-2xl ${
            centered ? 'mx-auto' : ''
          } ${light ? 'text-gray-300' : 'text-text-body'}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
