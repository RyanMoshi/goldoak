'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  href?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-gold' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}

export default function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]'

  const variantClasses: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-navy-800 focus:ring-primary/30',
    secondary: 'bg-secondary text-white hover:bg-gold-500 focus:ring-secondary/30',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/30',
    'outline-gold': 'border-2 border-secondary text-secondary hover:bg-secondary hover:text-white focus:ring-secondary/30',
    ghost: 'text-primary hover:bg-navy-50 focus:ring-primary/20',
  }

  const sizeClasses: Record<string, string> = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg',
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${classes} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}
