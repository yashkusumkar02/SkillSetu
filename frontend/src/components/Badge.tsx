import { HTMLAttributes } from 'react'
import clsx from 'clsx'

export type BadgeVariant = 'status' | 'neutral' | 'success' | 'warning' | 'danger'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: React.ReactNode
}

export default function Badge({ variant = 'neutral', className = '', children, ...rest }: BadgeProps) {
  const variants = {
    status: 'bg-brand-600/20 text-brand-200 border-brand-600/40',
    neutral: 'bg-white/10 text-white/80 border-white/20',
    success: 'bg-green-600/20 text-green-200 border-green-600/40',
    warning: 'bg-yellow-600/20 text-yellow-200 border-yellow-600/40',
    danger: 'bg-red-600/20 text-red-200 border-red-600/40'
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium border',
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
