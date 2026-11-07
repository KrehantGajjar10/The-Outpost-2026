import React from 'react'
import { cn } from '../../lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'forest' | 'subtle'
  interactive?: boolean
}

export function Card({
  children,
  className,
  variant = 'default',
  interactive = false,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-200'

  const variantStyles = {
    default: 'bg-white border border-[#e7e2d7] shadow-sm text-[#1c1916]',
    elevated: 'bg-white border border-[#d2cbbf] shadow-md text-[#1c1916]',
    forest: 'bg-[#0a2e22] text-[#f4f1ea] border border-[#195b45]/60 shadow-md',
    subtle: 'bg-[#f4f1ea]/70 border border-[#e7e2d7] text-[#1c1916]',
  }

  const interactiveStyles = interactive
    ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-[#a49c90] cursor-pointer'
    : ''

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], interactiveStyles, className)}
      {...props}
    >
      {children}
    </div>
  )
}
