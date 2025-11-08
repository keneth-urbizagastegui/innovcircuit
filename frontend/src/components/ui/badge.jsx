import React from 'react'
import { cn } from '../../utils/cn'

const variants = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border text-foreground',
}

export function Badge({ className, variant = 'secondary', ...props }) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium', variants[variant], className)} {...props} />
  )
}