'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  variant?: 'gold' | 'green'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  textColor?: string
  logoType?: 'icon' | 'sidename' | 'downname'
}

const Logo = ({ variant = 'gold', size = 'md', showText = false, textColor, logoType = 'icon' }: LogoProps) => {
  const [imgError, setImgError] = useState(false)

  const sizes: Record<string, { width: number; height: number; containerClass: string; textClass: string }> = {
    sm: { width: 36, height: 36, containerClass: 'w-9 h-9', textClass: 'text-lg' },
    md: { width: 48, height: 48, containerClass: 'w-12 h-12', textClass: 'text-xl' },
    lg: { width: 56, height: 56, containerClass: 'w-14 h-14', textClass: 'text-2xl' },
    xl: { width: 64, height: 64, containerClass: 'w-16 h-16', textClass: 'text-3xl' },
  }

  const logoFiles: Record<string, Record<string, string>> = {
    gold: {
      icon: '/assets/Gold Icon.png',
      sidename: '/assets/Gold SideNamelogo.png',
      downname: '/assets/Gold Downname logo.png',
    },
    green: {
      icon: '/assets/Green icon.png',
      sidename: '/assets/Green SideNamelogo.png',
      downname: '/assets/Green Downname logo.png',
    },
  }

  const config = sizes[size]
  const logoSrc = logoFiles[variant][logoType]

  // For sidename/downname logos, use wider dimensions
  const isWideLogo = logoType === 'sidename' || logoType === 'downname'
  const logoWidth = isWideLogo ? (size === 'xl' ? 200 : size === 'lg' ? 180 : size === 'md' ? 160 : 120) : config.width
  const logoHeight = isWideLogo ? (logoType === 'downname' ? (size === 'xl' ? 120 : size === 'lg' ? 100 : 80) : (size === 'xl' ? 60 : size === 'lg' ? 50 : 40)) : config.height
  const containerClass = isWideLogo ? (size === 'xl' ? 'w-[200px] h-[120px]' : size === 'lg' ? 'w-[180px] h-[100px]' : size === 'md' ? 'w-[160px] h-[80px]' : 'w-[120px] h-[60px]') : config.containerClass

  if (imgError) {
    return (
      <div className="flex items-center gap-3">
        <div className={`${isWideLogo ? 'w-12 h-12' : config.containerClass} rounded-lg bg-secondary flex items-center justify-center`}>
          <span className="text-white font-serif font-bold text-xl">G</span>
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
    <div className="flex items-center">
      <Image
        src={logoSrc}
        alt="GoldOak Insurance Solutions"
        width={logoWidth}
        height={logoHeight}
        className={`${containerClass} object-contain`}
        onError={() => setImgError(true)}
        priority
      />
      {showText && logoType === 'icon' && (
        <span className={`ml-2 font-serif font-semibold ${config.textClass} ${textColor || 'text-white'}`}>
          GoldOak
        </span>
      )}
    </div>
  )
}

export default Logo
