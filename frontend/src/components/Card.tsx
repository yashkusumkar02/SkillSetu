import { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div className={clsx('glass p-5', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('mb-4', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={clsx('text-xl font-semibold text-white', className)} {...rest}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={clsx('text-sm text-white/70 mt-1', className)} {...rest}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('mt-4 flex items-center gap-2', className)} {...rest}>
      {children}
    </div>
  )
}