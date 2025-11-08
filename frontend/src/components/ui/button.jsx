import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50'

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
  ghost: 'hover:bg-slate-100',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  success: 'bg-success text-success-foreground hover:bg-success/90',
}

const sizes = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  lg: 'h-11 px-6',
}

export function Button({ className, variant = 'default', size = 'md', as: Comp = 'button', loading = false, children, ...props }) {
  const disabled = loading || props.disabled
  return (
    <Comp
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled}
      aria-busy={loading ? 'true' : undefined}
      {...props}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </Comp>
  )
}