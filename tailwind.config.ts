import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import { THEMES, DEFAULT_THEME, lightVars, darkVars } from './src/lib/themes'

const v = (name: string) => `rgb(var(--ff-${name}) / <alpha-value>)`

// One block of CSS variables per theme. <html data-theme="…"> picks the theme;
// the .dark class and the always-dark bands (.night, .on-dark) swap in the
// bright accents.
const themeVariables = plugin(({ addBase }) => {
  for (const t of THEMES) {
    const sel = `[data-theme="${t.id}"]`
    const root = t.id === DEFAULT_THEME ? `:root, ${sel}` : sel
    addBase({
      [root]: lightVars(t),
      [`.dark${sel}`]: darkVars(t),
      [`${sel} .night, ${sel} .on-dark`]: darkVars(t),
    })
  }
  // Without a data-theme (no JS yet), the default theme's dark accents still apply.
  const d = THEMES.find((t) => t.id === DEFAULT_THEME)!
  addBase({ ':root.dark:not([data-theme]), :root:not([data-theme]) :is(.night, .on-dark)': darkVars(d) })
})

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Every colour reads a CSS variable set by the active theme (src/lib/themes.ts).
      colors: {
        // Brand / CTA
        primary:   v('primary'),
        secondary: v('secondary'),
        'on-ember': v('on-ember'),
        // Light page
        cream:         v('cream'),
        'lm-card':     v('card'),
        'lm-section':  v('section'),
        'lm-highlight':v('highlight'),
        'lm-text':     v('text'),
        'lm-muted':    v('muted'),
        'lm-border':   v('border'),
        'lm-accent':   v('ember'),
        charcoal:      v('text'),
        'warm-gray':   v('muted'),
        // Accents (bright in dark mode and on night bands)
        ember:        v('ember'),
        gold:         v('gold'),
        'ember-deep': v('ember-deep'),
        // Dark page
        'dark-bg':       v('dark-bg'),
        'dark-section':  v('dark-section'),
        'dark-raised':   v('dark-raised'),
        'dark-line':     v('dark-line'),
        'flame-base':    v('dark-bg'),
        'flame-surface': v('dark-surface'),
        warm:            v('warm'),
        'warm-muted':    v('warm-muted'),
        'text-warm':     v('warm'),
        'text-muted':    v('warm-muted'),
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'Georgia', 'serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease-in-out',
        'slide-up':     'slideUp 0.4s ease-out',
        'float':        'float 6s ease-in-out infinite',
        'float-delayed':'float 6s ease-in-out 2s infinite',
        'float-slow':   'float 8s ease-in-out 1s infinite',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'ember-drift':  'emberDrift 8s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        glowPulse: { '0%, 100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        emberDrift: {
          '0%':   { transform: 'translateY(0) translateX(0) scale(1)',   opacity: '0.7' },
          '50%':  { transform: 'translateY(-80px) translateX(15px) scale(0.7)', opacity: '0.3' },
          '100%': { transform: 'translateY(-160px) translateX(-5px) scale(0.3)', opacity: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [themeVariables],
}

export default config
