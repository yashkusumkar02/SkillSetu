import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, description, error, id, ...rest }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block mb-1.5 text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-white/60 mb-1.5">{description}</p>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'block w-full rounded-xl border bg-white/5 text-white placeholder-white/40',
            'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 focus:outline-none',
            'transition-colors',
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
              : 'border-white/10',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : description ? `${inputId}-description` : undefined}
          {...rest}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input