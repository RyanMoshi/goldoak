'use client'

import { useState } from 'react'

interface LogoProps {
  variant?: 'gold' | 'green'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const Logo = ({ 
  variant = 'gold', 
  size = 'md', 
  showText = true, 
  className = '' 
}: LogoProps) => {
  const [imageError, setImageError] = useState(false)
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }
  
  const textSizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  }
  
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }
  
  const getLogoSrc = () => {
    return '/assets/Gold Icon.png'
  }
  
  const getTextLogo = () => {
    return '/assets/Gold Downname logo.png'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center`}>
        {!imageError ? (
          <img 
            src={getLogoSrc()} 
            alt="Goldoak Insurance Logo" 
            className={`${iconSizes[size]} object-contain`}
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-white font-bold text-lg">G</span>
        )}
      </div>
      
      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold text-primary`}>
            Goldoak Insurance
          </h1>
          <p className="text-sm text-gray-600">Agency Limited</p>
        </div>
      )}
    </div>
  )
}

export default Logo
