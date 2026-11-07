import React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, clearable, onClear, value, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <span className="absolute left-3.5 text-warm-500 pointer-events-none flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          value={value}
          className={cn(
            'w-full rounded-xl bg-white border border-warm-300 py-2 text-sm text-warm-900 placeholder:text-warm-400 transition-colors',
            'focus-visible:border-forest-700 focus-visible:ring-1 focus-visible:ring-forest-700 focus-visible:outline-none',
            icon ? 'pl-10' : 'pl-3.5',
            clearable && value ? 'pr-9' : 'pr-3.5',
            className,
          )}
          {...props}
        />
        {clearable && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 text-warm-400 hover:text-warm-700 text-xs p-1 rounded-full cursor-pointer"
            aria-label="Clear input"
          >
            ✕
          </button>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
