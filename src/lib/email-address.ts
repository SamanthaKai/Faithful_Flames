import { prisma } from './prisma'

/** Emails are stored trimmed and lower-cased so "Ann@x.com" and "ann@x.com" are one account. */
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const e = value.trim().toLowerCase()
  return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null
}

/** Case-insensitive lookup, so accounts created before normalisation still match. */
export function findUserByEmail(email: string) {
  return prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
}
