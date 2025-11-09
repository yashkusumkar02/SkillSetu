import { useState, KeyboardEvent, ClipboardEvent } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import Input from './Input'

export default function TagInput({
  value,
  onChange,
  placeholder = 'Add skill and press Enter',
  label,
  description,
  error,
  id,
  'aria-label': ariaLabel
}: {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  label?: string
  description?: string
  error?: string
  id?: string
  'aria-label'?: string
}) {
  const [input, setInput] = useState('')

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    // Dedupe
    const normalized = trimmed.toLowerCase()
    if (value.some(t => t.toLowerCase() === normalized)) return
    onChange([...value, trimmed])
    setInput('')
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(t => t !== tagToRemove))
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    // Split by comma, space, or newline
    const tags = pastedText
      .split(/[,,\s\n]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0)
    
    if (tags.length > 0) {
      // Dedupe existing tags
      const existing = new Set(value.map(t => t.toLowerCase()))
      const newTags = tags.filter(t => !existing.has(t.toLowerCase()))
      if (newTags.length > 0) {
        onChange([...value, ...newTags])
      }
      setInput('')
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const inputId = id || `tag-input-${Math.random().toString(36).slice(2)}`

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
      <div
        className={clsx(
          'min-h-[46px] flex items-center flex-wrap gap-2 px-3 py-2 rounded-xl border bg-white/5',
          'focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/50',
          'transition-colors',
          error
            ? 'border-red-500/50 focus-within:border-red-500 focus-within:ring-red-500/50'
            : 'border-white/10'
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg bg-brand-600/20 text-brand-200 border border-brand-600/40"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 rounded"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          className="bg-transparent flex-1 outline-none border-none focus:ring-0 text-white placeholder-white/40 min-w-[120px]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={handlePaste}
          placeholder={value.length === 0 ? placeholder : ''}
          aria-label={ariaLabel || label || 'Add tags'}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}