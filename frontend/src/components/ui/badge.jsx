import React from 'react'
import { cn } from '../../utils/cn'

const variants = {
  default: 'bg-slate-900 text-white',
  secondary: 'bg-slate-100 text-slate-900',
  outline: 'border border-slate-200 text-slate-900',
}

export function Badge({ className, variant = 'secondary', ...props }) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium', variants[variant], className)} {...props} />
  )
}