export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, readBody, requireUser } from '@/lib/api'
import { RECOMMENDED_COUNT, getDevotionsInOrder, getJourney, isReadingPath } from '@/lib/journey'

// GET → the member's reading path, progress, and the earliest devotions' titles
// (shown in the "join at the latest" recommendation).
export async function GET() {
  const session = await requireUser()
  if (isResponse(session)) return session
  const list = await getDevotionsInOrder()
  const journey = await getJourney(session.user.id, list)
  return json({
    ...journey,
    first: list[0] ? { id: list[0].id } : null,
    earliest: list.slice(0, RECOMMENDED_COUNT).map((d, i) => ({ id: d.id, title: d.title, scripture: d.scripture, number: i + 1 })),
  })
}

// POST { path: 'BEGINNING' | 'LATEST' } → saves the member's choice (can be changed later)
export async function POST(req: Request) {
  const session = await requireUser()
  if (isResponse(session)) return session
  const { path } = await readBody(req)
  if (!isReadingPath(path)) return fail('Choose where you would like to start.')
  await prisma.user.update({ where: { id: session.user.id }, data: { readingPath: path } })
  return json({ path })
}
