import { text } from '@/lib/api'
import { isValidDayKey, startOfDay } from '@/lib/day'

type DevotionInput = {
  title: string
  scripture: string
  scriptureText: string
  teaching: string
  application: string | null
  prayerPoint: string | null
  dayKey: string
  publishedAt: Date
  isPublished: boolean
}

type Result<T> = { data: T } | { error: string }

/** Validates admin devotion input. `full` = every required field must be present (create). */
export function parseDevotion(body: Record<string, unknown>, full: true): Result<DevotionInput>
export function parseDevotion(body: Record<string, unknown>, full: false): Result<Partial<DevotionInput>>
export function parseDevotion(
  body: Record<string, unknown>,
  full: boolean,
): Result<DevotionInput> | Result<Partial<DevotionInput>> {
  const data: Partial<DevotionInput> = {}
  const has = (k: string) => full || body[k] !== undefined

  if (has('dayKey')) {
    if (!isValidDayKey(body.dayKey)) return { error: 'Please choose a valid date.' }
    data.dayKey = body.dayKey
    data.publishedAt = startOfDay(body.dayKey)
  }
  const required: [keyof DevotionInput, string, number, number][] = [
    ['title', 'Title', 3, 140],
    ['scripture', 'Bible reference', 2, 80],
    ['scriptureText', 'Scripture text', 5, 3000],
    ['teaching', 'Reflection', 20, 15000],
  ]
  for (const [key, label, min, max] of required) {
    if (!has(key)) continue
    const v = text(body[key], { min, max })
    if (v === null) return { error: `${label} must be between ${min} and ${max} characters.` }
    ;(data as Record<string, unknown>)[key] = v
  }
  for (const [key, label] of [['application', 'Practical application'], ['prayerPoint', 'Closing prayer']] as const) {
    if (!has(key)) continue
    const v = text(body[key], { max: 5000 })
    if (v === null) return { error: `${label} must be under 5,000 characters.` }
    data[key] = v || null
  }
  if (has('isPublished')) data.isPublished = body.isPublished === true

  return full ? { data: data as DevotionInput } : { data }
}
