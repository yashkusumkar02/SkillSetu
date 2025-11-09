import { SelectHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  description?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, description, error, id, options, ...rest }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2)}`
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block mb-1.5 text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-white/60 mb-1.5">{description}</p>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'block w-full rounded-xl border bg-white/5 text-white',
            'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 focus:outline-none',
            'transition-colors',
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
              : 'border-white/10',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : description ? `${selectId}-description` : undefined}
          {...rest}
        >
          {options.map(option => (
            <option key={option.value} value={option.value} className="bg-gray-900">
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
