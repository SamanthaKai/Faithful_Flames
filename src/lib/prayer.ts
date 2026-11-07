import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'

/**
 * The only filter under which a prayer request may ever be shown publicly:
 * approved by an admin, not marked private, and shared with explicit consent.
 * Every public query must use this.
 */
export const PUBLIC_PRAYER_WHERE: Prisma.PrayerRequestWhereInput = {
  status: 'APPROVED',
  isPrivate: false,
  shareConsent: true,
}

export type PublicPrayer = {
  id: string
  name: string | null
  content: string
  createdAt: string
  prayedCount: number
  hasPrayed: boolean
}

export async function getPublicPrayers(viewerId: string | null, take = 30): Promise<PublicPrayer[]> {
  const rows = await prisma.prayerRequest.findMany({
    where: PUBLIC_PRAYER_WHERE,
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      name: true,
      isAnonymous: true,
      content: true,
      createdAt: true,
      _count: { select: { prayers: true } },
      ...(viewerId ? { prayers: { where: { userId: viewerId }, select: { id: true } } } : {}),
    },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.isAnonymous ? null : r.name,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    prayedCount: r._count.prayers,
    hasPrayed: 'prayers' in r && Array.isArray(r.prayers) && r.prayers.length > 0,
  }))
}
