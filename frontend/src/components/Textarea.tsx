import { TextareaHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, description, error, id, ...rest }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2)}`
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block mb-1.5 text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-white/60 mb-1.5">{description}</p>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(
            'block w-full rounded-xl border bg-white/5 text-white placeholder-white/40',
            'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 focus:outline-none',
            'transition-colors resize-y',
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
              : 'border-white/10',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : description ? `${textareaId}-description` : undefined}
          {...rest}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
