import { HTMLAttributes } from 'react'
import clsx from 'clsx'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rounded' | 'avatar' | 'rectangular'
  width?: string | number
  height?: string | number
}

export default function Skeleton({
  variant = 'rounded',
  width,
  height,
  className = '',
  style,
  ...rest
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    rounded: 'rounded-xl',
    avatar: 'rounded-full',
    rectangular: 'rounded'
  }

  return (
    <div
      className={clsx(
        'animate-pulse bg-white/10',
        variants[variant],
        className
      )}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? '1rem' : variant === 'avatar' ? '2.5rem' : '1.5rem'),
        ...style
      }}
      aria-busy="true"
      aria-live="polite"
      {...rest}
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '80%' : '100%'}
          className="h-4"
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={clsx('glass p-5 space-y-4', className)}>
      <Skeleton variant="text" width="60%" height="1.5rem" />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton variant="rounded" width="4rem" height="1.5rem" />
        <Skeleton variant="rounded" width="6rem" height="1.5rem" />
      </div>
    </div>
  )
}
