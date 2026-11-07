import React from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      disabled = false,
      type = 'button',
      icon,
      iconPosition = 'left',
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]'

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-5 py-3 gap-2.5',
    }

    const variantStyles = {
      primary:
        'bg-[#124332] text-white hover:bg-[#0a2e22] shadow-sm hover:shadow active:bg-[#061c14] border border-[#195b45]/40',
      secondary:
        'bg-[#ecfdf5] text-[#124332] hover:bg-[#d1fae5] border border-[#a7f3d0]',
      outline:
        'bg-white text-[#2b2723] border border-[#d2cbbf] hover:bg-[#f4f1ea] hover:border-[#a49c90]',
      ghost:
        'bg-transparent text-[#423e38] hover:bg-[#e7e2d7]/50 hover:text-[#1c1916]',
      danger:
        'bg-[#e11d48] text-white hover:bg-[#be123c] active:bg-[#9f1239] shadow-sm',
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      </button>
    )
  },
)

Button.displayName = 'Button'
