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
  const interactive = !!onClick
  return (
    <div
      className={`card bg-white dark:bg-[#1a1d27] ${accentClass[accent]} ${interactive ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900' : ''} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
    >
      {children}
    </div>
  )
}
