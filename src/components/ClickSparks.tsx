'use client'

import { useEffect } from 'react'

// A small burst of sparks wherever someone clicks or taps.
// Pure DOM + CSS (see .spark in globals.css); skipped for reduced-motion users.
const COLORS = ['#FF7A29', '#F6B25E', '#FFD08A', '#FFF4E8']

export function ClickSparks() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const layer = document.createElement('div')
    layer.setAttribute('aria-hidden', 'true')
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:200;overflow:hidden'
    document.body.appendChild(layer)

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      const count = 16
      for (let i = 0; i < count; i++) {
        const s = document.createElement('span')
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6
        const dist = 40 + Math.random() * 60
        const size = 5 + Math.random() * 5
        s.className = 'spark'
        s.style.left = `${e.clientX}px`
        s.style.top = `${e.clientY}px`
        s.style.width = s.style.height = `${size}px`
        s.style.background = COLORS[i % COLORS.length]
        s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`)
        // bias upward a little, like sparks rising off a fire
        s.style.setProperty('--dy', `${Math.sin(angle) * dist - 18}px`)
        s.style.animationDuration = `${500 + Math.random() * 300}ms`
        layer.appendChild(s)
        s.addEventListener('animationend', () => s.remove(), { once: true })
      }
    }

    window.addEventListener('pointerdown', onDown, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', onDown)
      layer.remove()
    }
  }, [])

  return null
}
