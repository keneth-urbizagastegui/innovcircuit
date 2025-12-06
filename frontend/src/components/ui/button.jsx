import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const base =
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50 border'

const variants = {
  default:
    'bg-primary text-primary-foreground border-primary hover:bg-primary/90',
  outline:
    'bg-background text-foreground border-slate-300 hover:bg-slate-50 hover:border-slate-400',
  ghost:
    'bg-transparent text-slate-700 border-transparent hover:bg-slate-100 hover:border-slate-300',
  secondary:
    'bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/90',
  destructive:
    'bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90',
  success:
    'bg-success text-success-foreground border-success hover:bg-success/90',
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