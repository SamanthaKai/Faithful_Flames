import { prisma } from './prisma'
import { getVisibleDevotions } from './devotions'

// A member's reading path, chosen when they join:
//   BEGINNING: read from the very first devotion, at their own pace
//   LATEST:    join everyone at the latest devotion
export const READING_PATHS = ['BEGINNING', 'LATEST'] as const
export type ReadingPath = (typeof READING_PATHS)[number]
export const isReadingPath = (v: unknown): v is ReadingPath => READING_PATHS.includes(v as ReadingPath)

/** How many early devotions the "join at the latest" pop-up recommends. */
export const RECOMMENDED_COUNT = 5

/** Visible devotions, oldest first (Day 1 = the first devotion ever published). */
export async function getDevotionsInOrder(now = new Date()) {
  return (await getVisibleDevotions(now)).reverse()
}

export type Journey = {
  path: ReadingPath | null
  total: number
  readCount: number
  /** First devotion (oldest first) the member hasn't opened yet. */
  next: { id: string; title: string; number: number } | null
}

export async function getJourney(userId: string, ordered?: Awaited<ReturnType<typeof getDevotionsInOrder>>): Promise<Journey> {
  const [user, list] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { readingPath: true } }),
    ordered ?? getDevotionsInOrder(),
  ])
  const reads = await prisma.devotionRead.findMany({
    where: { userId, devotionId: { in: list.map((d) => d.id) } },
    select: { devotionId: true },
  })
  const read = new Set(reads.map((r) => r.devotionId))
  const idx = list.findIndex((d) => !read.has(d.id))
  return {
    path: isReadingPath(user?.readingPath) ? user.readingPath : null,
    total: list.length,
    readCount: read.size,
    next: idx === -1 ? null : { id: list[idx].id, title: list[idx].title, number: idx + 1 },
  }
}

/** Record that a member opened a devotion. Safe to call repeatedly. */
export async function markRead(userId: string, devotionId: string) {
  await prisma.devotionRead.createMany({ data: [{ userId, devotionId }], skipDuplicates: true }).catch(() => {})
}
