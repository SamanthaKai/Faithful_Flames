'use client'

import { useState } from 'react'
import Image from 'next/image'

interface UserAvatarProps {
  src: string | null
  name: string | null
  size?: number
  className?: string
  ringClass?: string
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export function UserAvatar({ src, name, size = 40, className = '', ringClass }: UserAvatarProps) {
  const [open, setOpen] = useState(false)
  const initial = getInitials(name)
  const ring = ringClass ?? 'ring-2 ring-lm-border dark:ring-ember/20'

  const fallback = (
    <div
      className="rounded-full flex items-center justify-center font-bold bg-lm-accent/15 dark:bg-ember/15 text-lm-accent dark:text-ember flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) }}
    >
      {initial}
    </div>
  )

  if (!src) {
    return <div className={`flex-shrink-0 ${className}`}>{fallback}</div>
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(true) }}
        className={`flex-shrink-0 rounded-full overflow-hidden focus:outline-none hover:opacity-90 transition-opacity ${className}`}
        title={`View ${name ?? 'profile picture'}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt={name ?? ''}
          width={size}
          height={size}
          className={`rounded-full object-cover ${ring}`}
          unoptimized
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex flex-col items-center gap-3 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={name ?? ''}
              width={288}
              height={288}
              className="rounded-full object-cover shadow-2xl ring-4 ring-white/20"
              unoptimized
            />
            {name && (
              <p className="text-white text-sm font-semibold drop-shadow">{name}</p>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center text-xl leading-none hover:bg-black transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
