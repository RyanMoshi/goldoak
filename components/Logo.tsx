'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  variant?: 'gold' | 'green'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  textColor?: string
}

const Logo = ({ variant = 'gold', size = 'md', showText = false, textColor }: LogoProps) => {
  const [imgError, setImgError] = useState(false)

  const sizes: Record<string, { width: number; height: number; containerClass: string; textClass: string }> = {
    sm: { width: 28, height: 28, containerClass: 'w-7 h-7', textClass: 'text-lg' },
    md: { width: 36, height: 36, containerClass: 'w-9 h-9', textClass: 'text-xl' },
    lg: { width: 44, height: 44, containerClass: 'w-11 h-11', textClass: 'text-2xl' },
  }

  const config = sizes[size]
  const logoSrc = variant === 'gold' ? '/assets/Gold Icon.png' : '/assets/Green icon.png'

  if (imgError) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${config.containerClass} rounded-lg bg-secondary flex items-center justify-center`}>
          <span className="text-white font-serif font-bold text-lg">G</span>
        </div>
        {showText && (
          <span className={`font-serif font-semibold ${config.textClass} ${textColor || 'text-white'}`}>
            GoldOak
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Image
        src={logoSrc}
        alt="GoldOak Insurance Solutions"
        width={config.width}
        height={config.height}
        className={`${config.containerClass} object-contain`}
        onError={() => setImgError(true)}
        priority
      />
      {showText && (
        <span className={`font-serif font-semibold ${config.textClass} ${textColor || 'text-white'}`}>
          GoldOak
        </span>
      )}
    </div>
  )
}

export default Logo
