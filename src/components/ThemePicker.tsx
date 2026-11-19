'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { THEMES, type Theme } from '@/lib/themes'
import { useTheme } from './ThemeProvider'

// The colour-theme selector. Real radio inputs (visually hidden) give keyboard
// arrows and screen-reader support for free; the previews are drawn from the
// same palette values the site uses, so they always match.

function Check({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 8.5 3 3 6-7" />
    </svg>
  )
}

/** A miniature page in the theme's colours: a card, a heading, a verse and a button. */
function Preview({ t, dark }: { t: Theme; dark: boolean }) {
  const page = dark ? t.dark.page : t.light.page
  const card = dark ? t.dark.surface : t.light.card
  const border = dark ? t.dark.line : t.light.border
  const text = dark ? t.dark.text : t.light.text
  const muted = dark ? t.dark.muted : t.light.muted
  const accent = dark ? t.dark.accent : t.light.accent
  const soft = dark ? t.dark.soft : t.light.soft
  return (
    <div className="no-transition relative aspect-[16/10] w-full overflow-hidden rounded-xl" style={{ background: page }} aria-hidden="true">
      {/* the always-dark masthead band */}
      <div
        className="absolute inset-x-0 top-0 h-[34%]"
        style={{ background: `radial-gradient(ellipse 70% 90% at 50% 120%, ${t.dark.accent}40, transparent 70%), linear-gradient(180deg, ${t.night.top}, ${t.night.bottom})` }}
      >
        <span className="absolute left-[9%] top-[30%] h-[9%] w-[22%] rounded-full" style={{ background: t.dark.soft, opacity: 0.85 }} />
        <span className="absolute left-[9%] top-[56%] h-[14%] w-[48%] rounded-full" style={{ background: t.dark.text, opacity: 0.9 }} />
      </div>
      {/* a card */}
      <div className="absolute inset-x-[9%] bottom-[11%] top-[44%] rounded-lg border" style={{ background: card, borderColor: border }}>
        <span className="absolute left-[7%] top-[16%] h-[11%] w-[26%] rounded-full" style={{ background: accent }} />
        <span className="absolute left-[7%] top-[38%] h-[11%] w-[62%] rounded-full" style={{ background: text, opacity: 0.85 }} />
        <span className="absolute left-[7%] top-[60%] h-[9%] w-[46%] rounded-full" style={{ background: muted, opacity: 0.5 }} />
        <span className="absolute bottom-[16%] right-[7%] h-[24%] w-[26%] rounded-full" style={{ background: accent }} />
        <span className="absolute bottom-[16%] right-[36%] h-[24%] w-[9%] rounded-full" style={{ background: soft, opacity: 0.7 }} />
      </div>
    </div>
  )
}

/** Three overlapping dots: the theme's accent, soft accent and page colour. */
function Swatch({ t, dark }: { t: Theme; dark: boolean }) {
  const ring = dark ? t.dark.line : t.light.border
  return (
    <span className="no-transition flex shrink-0 -space-x-1.5" aria-hidden="true">
      {[dark ? t.dark.accent : t.light.accent, dark ? t.dark.soft : t.light.soft, dark ? t.dark.page : t.light.page].map((c, i) => (
        <span key={i} className="h-5 w-5 rounded-full border-2" style={{ background: c, borderColor: ring }} />
      ))}
    </span>
  )
}

export function ThemePicker({ compact = false }: { compact?: boolean }) {
  const { palette, setPalette, theme } = useTheme()
  const name = useId()
  const dark = theme === 'dark'

  if (compact) {
    return (
      <div role="radiogroup" aria-label="Colour theme" className="space-y-1">
        {THEMES.map((t) => {
          const on = palette === t.id
          return (
            <label key={t.id} className="block cursor-pointer">
              <input type="radio" name={name} value={t.id} checked={on} onChange={() => setPalette(t.id)} className="peer sr-only" />
              <span
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 peer-focus-visible:ring-2 peer-focus-visible:ring-ember/60 ${
                  on ? 'bg-lm-highlight/60 dark:bg-white/[0.06]' : 'hover:bg-lm-highlight/40 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Swatch t={t} dark={dark} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-lm-text dark:text-warm">{t.name}</span>
                  <span className="block text-xs text-lm-muted dark:text-warm-muted">{t.colour}</span>
                </span>
                {on && <Check className="h-4 w-4 text-ember" />}
              </span>
            </label>
          )
        })}
      </div>
    )
  }

  return (
    <fieldset>
      <legend className="sr-only">Colour theme</legend>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {THEMES.map((t) => {
          const on = palette === t.id
          return (
            <label key={t.id} className="group block cursor-pointer">
              <input type="radio" name={name} value={t.id} checked={on} onChange={() => setPalette(t.id)} className="peer sr-only" />
              <span
                className={`relative flex h-full flex-col rounded-2xl border p-2.5 peer-focus-visible:ring-2 peer-focus-visible:ring-ember/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-cream dark:peer-focus-visible:ring-offset-dark-bg ${
                  on
                    ? 'border-ember bg-lm-card shadow-[0_0_0_1px_rgb(var(--ff-ember))] dark:bg-flame-surface'
                    : 'border-lm-border bg-lm-card hover:border-ember/50 dark:border-ember/15 dark:bg-flame-surface dark:hover:border-ember/40'
                }`}
              >
                <Preview t={t} dark={dark} />
                <span className="flex items-start justify-between gap-2 px-1 pb-1 pt-3">
                  <span className="min-w-0">
                    <span className="block font-heading text-lg font-bold leading-tight text-lm-text dark:text-warm">{t.name}</span>
                    <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-lm-muted dark:text-warm-muted">{t.colour}</span>
                  </span>
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      on ? 'border-ember bg-ember text-on-ember' : 'border-lm-border dark:border-ember/25'
                    }`}
                  >
                    {on && <Check className="h-3 w-3" />}
                  </span>
                </span>
                <span className="px-1 pb-1 text-xs leading-snug text-lm-muted dark:text-warm-muted">{t.mood}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Navbar button that opens the compact picker. */
export function ThemeMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="sm:relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Colour theme"
        title="Colour theme"
        className="rounded-full p-2 text-lm-muted hover:bg-lm-highlight/60 hover:text-lm-text dark:text-warm-muted dark:hover:bg-white/5 dark:hover:text-warm"
      >
        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.9 0-.5-.2-.9-.5-1.3-.3-.3-.5-.8-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3Z" />
          <circle cx="7.5" cy="11.5" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="10" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="14.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-x-4 top-[4.25rem] z-50 rounded-2xl border border-lm-border bg-lm-card p-2 shadow-xl animate-fade-in dark:border-ember/15 dark:bg-flame-surface sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-64">
          <p className="kicker px-3 pb-2 pt-2">Colour theme</p>
          <ThemePicker compact />
        </div>
      )}
    </div>
  )
}
