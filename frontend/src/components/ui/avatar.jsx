import React from 'react'
import { cn } from '../../utils/cn'
import { FALLBACK_AVATAR, onErrorSetSrc } from '../../utils/imageUtils'

export function Avatar({ className, src, alt, children }) {
  return (
    <div className={cn('inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-200', className)}>
      {src ? <img src={src} alt={alt} loading="lazy" onError={onErrorSetSrc(FALLBACK_AVATAR)} className="h-full w-full object-cover" /> : children}
    </div>
  )
}