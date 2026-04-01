import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`badge ${className}`}>
      {children}
    </span>
  )
}

export function NetChip({ network }: { network: string }) {
  const cls = `net-chip net-${network}`
  const label = network.toUpperCase()
  return <span className={cls}>{label}</span>
}
