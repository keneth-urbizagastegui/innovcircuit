import React from 'react'
import { cn } from '../../utils/cn'

export function Avatar({ className, src, alt, children }) {
  return (
    <div className={cn('inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-200', className)}>
      {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : children}
    </div>
  )
}