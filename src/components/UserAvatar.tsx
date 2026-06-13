'use client'

import { useState } from 'react'
import Image from 'next/image'

// ── Flame avatar palette ──────────────────────────────────────────────────────
// Adjust these colors to change the per-user flame tones.
const FLAME_PALETTE = [
  { primary: '#FF7A29', inner: '#FFBB6B' },  // ember orange
  { primary: '#F6B25E', inner: '#FFD166' },  // warm gold
  { primary: '#E05C2A', inner: '#FF9F3E' },  // deep flame
  { primary: '#D97706', inner: '#FCD34D' },  // amber
  { primary: '#C2410C', inner: '#F97316' },  // deep red-orange
  { primary: '#FBBF24', inner: '#FEF08A' },  // bright gold
] as const

function hashName(name: string | null): number {
  const s = name ?? 'default'
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) % FLAME_PALETTE.length
}

function FlameAvatar({ name, size }: { name: string | null; size: number }) {
  const { primary, inner } = FLAME_PALETTE[hashName(name)]
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
      title={name ?? undefined}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Circle background — soft tinted */}
        <circle cx="20" cy="20" r="20" fill={primary} opacity="0.13" />
        {/* Outer flame body */}
        <path
          d="M20 35
             C13 35 9 29.5 9 24
             C9 19.5 12 16.5 13.5 13.5
             C14.5 11 14 8 14 8
             C16 11 17 12.5 18 14
             C18 10.5 16.5 7 16.5 7
             C18.5 10 20 13 20 15.5
             C21 12.5 22 9.5 24 7
             C23 10 23 13 24 15.5
             C26 12 27.5 9.5 28 8
             C28 8 27 11 27 13.5
             C28.5 16.5 31 19.5 31 24
             C31 29.5 27 35 20 35 Z"
          fill={primary}
          opacity="0.82"
        />
        {/* Inner flame highlight */}
        <path
          d="M20 31
             C17 31 15 28 15 25
             C15 22 17 19.5 18 17.5
             C18.5 19.5 19 21 20 22.5
             C21 21 21.5 19.5 22 17.5
             C23 19.5 25 22 25 25
             C25 28 23 31 20 31 Z"
          fill={inner}
          opacity="0.72"
        />
        {/* Tip glow */}
        <ellipse cx="20" cy="13" rx="2.5" ry="3.5" fill={inner} opacity="0.48" />
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

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
  const ring = ringClass ?? 'ring-2 ring-lm-border dark:ring-ember/20'

  if (!src) {
    return (
      <div className={`flex-shrink-0 ${className}`}>
        <FlameAvatar name={name} size={size} />
      </div>
    )
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
