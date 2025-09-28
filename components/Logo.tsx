'use client'

import { useState } from 'react'

interface LogoProps {
  variant?: 'gold' | 'green'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  textColor?: string
}

const Logo = ({ 
  variant = 'gold', 
  size = 'md', 
  showText = true, 
  className = '',
  textColor = 'text-primary'
}: LogoProps) => {
  const [imageError, setImageError] = useState(false)
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20'
  }
  
  const textSizes = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-3xl'
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
      {!imageError ? (
        <img 
          src={getLogoSrc()} 
          alt="Goldoak Insurance Logo" 
          className={`${sizeClasses[size]} object-contain`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-secondary rounded-lg flex items-center justify-center`}>
          <span className="text-white font-bold text-lg">G</span>
        </div>
      )}
      
      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold ${textColor}`}>
            Goldoak Insurance
          </h1>
          <p className="text-sm text-gray-600">Agency Limited</p>
        </div>
      )}
    </div>
  )
}

export default Logo
