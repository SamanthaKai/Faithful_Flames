'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  delay?: string
}

export function ScrollReveal({ children, className = '', delay = '0s' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = delay
          el.classList.add('visible')
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}
