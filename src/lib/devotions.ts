import { prisma } from './prisma'
import { devotionDay, todayKey } from './day'

export const devotionListSelect = {
  id: true,
  title: true,
  scripture: true,
  scriptureText: true,
  teaching: true,
  dayKey: true,
  publishedAt: true,
} as const

/**
 * Published devotions whose day has arrived (future-dated ones stay hidden
 * until their Kampala day), newest first.
 */
export async function getVisibleDevotions(now = new Date()) {
  const today = todayKey(now)
  const rows = await prisma.devotion.findMany({
    where: { isPublished: true, OR: [{ dayKey: { lte: today } }, { dayKey: null }] },
    select: devotionListSelect,
  })
  return rows
    .map((d) => ({ ...d, day: devotionDay(d) }))
    .filter((d) => d.day <= today)
    .sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : +new Date(b.publishedAt) - +new Date(a.publishedAt)))
}

/** Today's devotion if one exists, otherwise the most recent one (flagged as not today). */
export async function getFeaturedDevotion(now = new Date()) {
  const today = todayKey(now)
  const list = await getVisibleDevotions(now)
  const featured = list[0] ?? null
  return { devotion: featured, isToday: !!featured && featured.day === today, today }
}

/** A published devotion that is visible today, or null. */
export async function getVisibleDevotion(id: string, now = new Date()) {
  const d = await prisma.devotion.findFirst({ where: { id, isPublished: true } })
  if (!d) return null
  if (devotionDay(d) > todayKey(now)) return null
  return d
}

export function excerpt(text: string, max = 220) {
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length <= max ? t : t.slice(0, t.lastIndexOf(' ', max)) + '…'
}
