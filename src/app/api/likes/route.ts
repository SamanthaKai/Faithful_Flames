export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, getSession, isResponse, json, rateLimited, readBody, requireUser } from '@/lib/api'
import { getVisibleDevotion } from '@/lib/devotions'

// Likes on devotions and on devotion discussion comments. Open at any time.
const TYPES = ['DEVOTION', 'COMMENT'] as const
type LikeType = (typeof TYPES)[number]
const isType = (v: unknown): v is LikeType => TYPES.includes(v as LikeType)

async function exists(contentType: LikeType, contentId: string) {
  if (contentType === 'DEVOTION') return !!(await getVisibleDevotion(contentId))
  const c = await prisma.comment.findUnique({ where: { id: contentId } })
  if (!c || c.contentType !== 'DEVOTION' || c.deletedAt || c.isHidden) return false
  return !!(await getVisibleDevotion(c.contentId))
}

const countOf = (contentType: LikeType, contentId: string) => prisma.like.count({ where: { contentType, contentId } })

// GET ?contentType=&contentId=  → { count, liked }
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const contentType = searchParams.get('contentType')
  const contentId = searchParams.get('contentId')
  if (!isType(contentType) || !contentId) return fail('Invalid request.')
  const session = await getSession()
  const [count, mine] = await Promise.all([
    countOf(contentType, contentId),
    session?.user?.id
      ? prisma.like.findUnique({ where: { userId_contentType_contentId: { userId: session.user.id, contentType, contentId } } })
      : null,
  ])
  return json({ count, liked: !!mine })
}

// POST { contentType, contentId } → toggles the like, returns { count, liked }
export async function POST(req: Request) {
  const session = await requireUser()
  if (isResponse(session)) return session
  const { contentType, contentId } = await readBody(req)
  if (!isType(contentType) || typeof contentId !== 'string') return fail('Invalid like.')
  if (rateLimited(`like:${session.user.id}`, 60, 60_000)) return fail('Slow down a little, please.', 429)
  if (!(await exists(contentType, contentId))) return fail('Not found.', 404)

  const key = { userId: session.user.id, contentType, contentId }
  const existing = await prisma.like.findUnique({ where: { userId_contentType_contentId: key } })
  if (existing) await prisma.like.delete({ where: { id: existing.id } }).catch(() => {})
  else await prisma.like.upsert({ where: { userId_contentType_contentId: key }, create: key, update: {} })
  return json({ count: await countOf(contentType, contentId), liked: !existing })
}
