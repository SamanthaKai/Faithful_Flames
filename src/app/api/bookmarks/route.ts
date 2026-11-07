export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, getSession, isResponse, json, readBody, requireUser } from '@/lib/api'
import { getVisibleDevotion } from '@/lib/devotions'

const TYPES = ['DEVOTION', 'ARTICLE'] as const
type BookmarkType = (typeof TYPES)[number]
const isType = (v: unknown): v is BookmarkType => TYPES.includes(v as BookmarkType)

// GET ?contentType=&contentId=  → { bookmarked } for one item (false when signed out)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const contentType = searchParams.get('contentType')
  const contentId = searchParams.get('contentId')
  const session = await getSession()
  if (!session?.user?.id || !isType(contentType) || !contentId) return json({ bookmarked: false })
  const found = await prisma.bookmark.findUnique({
    where: { userId_contentType_contentId: { userId: session.user.id, contentType, contentId } },
  })
  return json({ bookmarked: !!found })
}

// POST { contentType, contentId } → toggles the bookmark
export async function POST(req: Request) {
  const session = await requireUser()
  if (isResponse(session)) return session
  const { contentType, contentId } = await readBody(req)
  if (!isType(contentType) || typeof contentId !== 'string') return fail('Invalid bookmark.')

  const exists =
    contentType === 'DEVOTION'
      ? !!(await getVisibleDevotion(contentId))
      : (await prisma.article.count({ where: { id: contentId, isPublished: true } })) > 0
  if (!exists) return fail('Not found.', 404)

  const key = { userId: session.user.id, contentType, contentId }
  const existing = await prisma.bookmark.findUnique({ where: { userId_contentType_contentId: key } })
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } })
    return json({ bookmarked: false })
  }
  await prisma.bookmark.upsert({ where: { userId_contentType_contentId: key }, create: key, update: {} })
  return json({ bookmarked: true })
}
