import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand / CTA
        primary:   '#F59E0B',
        secondary: '#D97706',
        // Light mode — warm, elegant, spiritual
        cream:        '#FFF3E6',
        'lm-card':    '#FFF8F0',
        'lm-section': '#FFF0E0',
        'lm-highlight':'#FFE2C2',
        'lm-text':    '#2A140A',
        'lm-muted':   '#6E4A34',
        'lm-border':  '#F1D3B3',
        'lm-accent':  '#FF7A29',
        charcoal:     '#2A140A',
        'warm-gray':  '#6E4A34',
        // Dark mode (campfire)
        'dark-bg': '#0D0A0A',
        ember:     '#FF7A29',
        gold:      '#F6B25E',
        'ember-deep':'#A63B1E',
        'flame-base':   '#0D0A0A',
        'flame-surface':'#161111',
        'text-warm':    '#FFF4E8',
        'text-muted':   '#BFAEA3',
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
  plugins: [],
}

export default config
