import React from 'react'

type AccentColor = 'orange' | 'blue' | 'violet' | 'amber' | 'red' | 'none'

interface CardProps {
  children: React.ReactNode
  className?: string
  accent?: AccentColor
  onClick?: () => void
}

const accentClass: Record<AccentColor, string> = {
  orange: 'card-top-orange',
  blue:   'card-top-blue',
  violet: 'card-top-violet',
  amber:  'card-top-amber',
  red:    'card-top-red',
  none:   '',
}

export function Card({ children, className = '', accent = 'none', onClick }: CardProps) {
  return (
    <div
      className={`card bg-white dark:bg-[#1a1d27] ${accentClass[accent]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
