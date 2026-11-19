// The four Faithful Flames colour themes — the single source of truth.
//
// tailwind.config.ts turns these into CSS variables (one block per theme,
// keyed by <html data-theme="…">), and every colour token the site uses
// (ember, cream, lm-text, …) reads from those variables. The theme picker
// draws its previews from the same values, so a change here updates the
// whole site and the previews together.
//
// Each theme has three sets:
//   light — the normal page
//   dark  — the page in dark mode (the sun/moon toggle)
//   night — the always-dark bands (homepage photo, devotion masthead).
//           Accents there use the bright dark-mode versions in both modes.

export type ThemeId = 'grace' | 'beloved' | 'abide' | 'stillness'

export const DEFAULT_THEME: ThemeId = 'grace'
export const THEME_STORAGE_KEY = 'ff-theme'

type Light = {
  primary: string // main buttons, logo
  secondary: string // primary hover
  page: string // page background
  card: string // cards, panels, menus
  section: string // tinted bands, footer
  highlight: string // selected rows, soft hovers
  text: string
  muted: string
  border: string
  accent: string // links, kickers, icons, active states
  accentDeep: string // the dark end of decorative gradients
  soft: string // the light accent (on dark bands)
  onAccent: string // text on an accent-filled button
}

type Dark = {
  page: string
  surface: string // cards, panels, menus
  section: string // footer, tinted bands
  raised: string // small raised chips
  line: string // strong dividers
  text: string
  muted: string
  accent: string
  soft: string
  onAccent: string
}

type Night = { top: string; middle: string; bottom: string }

export type Theme = {
  id: ThemeId
  name: string // the identity, e.g. "Grace"
  colour: string // e.g. "Green"
  mood: string
  light: Light
  dark: Dark
  night: Night
}

export const THEMES: Theme[] = [
  {
    id: 'grace',
    name: 'Grace',
    colour: 'Green',
    mood: 'Peaceful, grounded and refreshing',
    light: {
      primary: '#2E6A4E',
      secondary: '#23543D',
      page: '#F3F6F1',
      card: '#FAFCF8',
      section: '#E8EFE6',
      highlight: '#DAE6D6',
      text: '#1A2A21',
      muted: '#4A5D52',
      border: '#CFDCCC',
      accent: '#2E6A4E',
      accentDeep: '#1D4633',
      soft: '#8FB497',
      onAccent: '#FFFFFF',
    },
    dark: {
      page: '#0B100D',
      surface: '#131A16',
      section: '#080C0A',
      raised: '#1B241F',
      line: '#2C3A32',
      text: '#EEF4EE',
      muted: '#A7B8AD',
      accent: '#7FC29B',
      soft: '#B6D3AE',
      onAccent: '#0B100D',
    },
    night: { top: '#050907', middle: '#0B130F', bottom: '#122019' },
  },
  {
    id: 'beloved',
    name: 'Beloved',
    colour: 'Pink',
    mood: 'Gentle, warm and comforting',
    light: {
      primary: '#974262',
      secondary: '#843952',
      page: '#FBF5F3',
      card: '#FFFAF8',
      section: '#F5E9E7',
      highlight: '#F0DADC',
      text: '#2E1A21',
      muted: '#6A4E58',
      border: '#EAD4D7',
      accent: '#974262',
      accentDeep: '#73304A',
      soft: '#D9A2B4',
      onAccent: '#FFFFFF',
    },
    dark: {
      page: '#110B0D',
      surface: '#1A1215',
      section: '#0C0809',
      raised: '#251A1E',
      line: '#3B2B31',
      text: '#F8EEF1',
      muted: '#C3AEB5',
      accent: '#E59DB5',
      soft: '#EEC6D2',
      onAccent: '#1A0C12',
    },
    night: { top: '#0A0607', middle: '#150C10', bottom: '#211219' },
  },
  {
    id: 'abide',
    name: 'Abide',
    colour: 'Purple',
    mood: 'Reflective, calm and contemplative',
    light: {
      primary: '#5D4889',
      secondary: '#4A3872',
      page: '#F6F4FA',
      card: '#FBFAFD',
      section: '#ECE8F4',
      highlight: '#E0D9EE',
      text: '#221D2E',
      muted: '#574F67',
      border: '#D9D2E7',
      accent: '#5D4889',
      accentDeep: '#3D2F61',
      soft: '#AE9DD6',
      onAccent: '#FFFFFF',
    },
    dark: {
      page: '#0D0B12',
      surface: '#15121C',
      section: '#09080D',
      raised: '#1E1A28',
      line: '#322C41',
      text: '#F2EFF8',
      muted: '#B4ACC5',
      accent: '#B8A5E8',
      soft: '#D5C9EF',
      onAccent: '#120D1E',
    },
    night: { top: '#07060B', middle: '#0F0C17', bottom: '#191426' },
  },
  {
    id: 'stillness',
    name: 'Stillness',
    colour: 'Blue',
    mood: 'Reassuring, clear and restful',
    light: {
      primary: '#2E5983',
      secondary: '#234668',
      page: '#F3F6F9',
      card: '#FAFCFD',
      section: '#E7EDF4',
      highlight: '#D7E2ED',
      text: '#19242F',
      muted: '#4B5A68',
      border: '#D0DBE6',
      accent: '#2E5983',
      accentDeep: '#1C3653',
      soft: '#97B3D1',
      onAccent: '#FFFFFF',
    },
    dark: {
      page: '#0A0E12',
      surface: '#11171D',
      section: '#070A0D',
      raised: '#19212A',
      line: '#2A3643',
      text: '#EEF3F8',
      muted: '#A9B6C4',
      accent: '#8EB7E1',
      soft: '#BCD0E6',
      onAccent: '#0A121C',
    },
    night: { top: '#05080C', middle: '#0A121B', bottom: '#111D2B' },
  },
]

export const THEME_IDS = THEMES.map((t) => t.id)

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === 'string' && (THEME_IDS as string[]).includes(v)
}

/**
 * Runs in <head> before the page paints, so a returning visitor never sees a
 * flash of the default theme (or of light mode). Tiny and dependency-free.
 */
export const themeBootScript = `(function(){try{var d=document.documentElement,p=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(${JSON.stringify(THEME_IDS)}.indexOf(p)>-1)d.setAttribute('data-theme',p);var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))d.classList.add('dark')}catch(e){}})()`

// ── CSS variables ──────────────────────────────────────────────────────────
// Values are "R G B" so Tailwind can add opacity: rgb(var(--ff-ember) / 0.1)

function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

/** Variables for the normal (light) page. */
export function lightVars(t: Theme): Record<string, string> {
  const { light: l, dark: d, night: n } = t
  return {
    '--ff-primary': rgb(l.primary),
    '--ff-secondary': rgb(l.secondary),
    '--ff-cream': rgb(l.page),
    '--ff-card': rgb(l.card),
    '--ff-section': rgb(l.section),
    '--ff-highlight': rgb(l.highlight),
    '--ff-text': rgb(l.text),
    '--ff-muted': rgb(l.muted),
    '--ff-border': rgb(l.border),
    '--ff-ember': rgb(l.accent),
    '--ff-ember-deep': rgb(l.accentDeep),
    '--ff-gold': rgb(l.soft),
    '--ff-on-ember': rgb(l.onAccent),
    // Dark surfaces are defined here too, for the dark: classes and night bands
    '--ff-dark-bg': rgb(d.page),
    '--ff-dark-surface': rgb(d.surface),
    '--ff-dark-section': rgb(d.section),
    '--ff-dark-raised': rgb(d.raised),
    '--ff-dark-line': rgb(d.line),
    '--ff-warm': rgb(d.text),
    '--ff-warm-muted': rgb(d.muted),
    '--ff-night-top': rgb(n.top),
    '--ff-night-middle': rgb(n.middle),
    '--ff-night-bottom': rgb(n.bottom),
  }
}

/** Overrides for dark mode, and for always-dark bands in either mode. */
export function darkVars(t: Theme): Record<string, string> {
  const { dark: d } = t
  return {
    '--ff-ember': rgb(d.accent),
    '--ff-gold': rgb(d.soft),
    '--ff-on-ember': rgb(d.onAccent),
  }
}
