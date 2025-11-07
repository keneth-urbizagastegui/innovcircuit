import React from 'react'
import { cn } from '../../utils/cn'

export function Dialog({ open, onClose, children, className }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className={cn('relative z-10 w-full max-w-md rounded-xl bg-white shadow-lg border border-border', className)}>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('px-6 pt-5', className)} {...props} />
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold text-foreground', className)} {...props} />
}

export function DialogDescription({ className, ...props }) {
  return <div className={cn('px-6 py-4 text-sm text-muted-foreground', className)} {...props} />
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn('flex items-center justify-end gap-3 px-6 pb-5', className)} {...props} />
}