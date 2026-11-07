export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, getSession, isResponse, json, rateLimited, readBody, requireUser, text } from '@/lib/api'
import { isDiscussionOpen } from '@/lib/day'
import { getVisibleDevotion } from '@/lib/devotions'
import { getDiscussion } from '@/lib/comments'
import { containsProfanity } from '@/lib/profanity'

// GET ?devotionId=  → the devotion's discussion (readable forever)
export async function GET(req: Request) {
  const devotionId = new URL(req.url).searchParams.get('devotionId')
  if (!devotionId) return fail('devotionId is required.')
  const devotion = await getVisibleDevotion(devotionId)
  if (!devotion) return fail('Devotion not found.', 404)
  const session = await getSession()
  const viewer = session?.user?.id ? { id: session.user.id, role: session.user.role } : null
  return json(await getDiscussion(devotion, viewer))
}

// POST { devotionId, content, parentId? }
export async function POST(req: Request) {
  const session = await requireUser()
  if (isResponse(session)) return session

  const body = await readBody(req)
  if (typeof body.devotionId !== 'string') return fail('devotionId is required.')
  const devotion = await getVisibleDevotion(body.devotionId)
  if (!devotion) return fail('Devotion not found.', 404)

  // Server-side expiry: a discussion only accepts comments on its own Kampala day.
  if (!isDiscussionOpen(devotion)) {
    return fail('This discussion has closed. It stays readable, but no new comments can be added.', 403)
  }

  const content = text(body.content, { min: 1, max: 2000 })
  if (content === null) return fail('Comments must be between 1 and 2,000 characters.')
  if (containsProfanity(content)) return fail('Please keep the language kind and clean.')
  if (rateLimited(`comment:${session.user.id}`, 8, 60_000)) {
    return fail('You are commenting very quickly. Please wait a minute.', 429)
  }

  let parentId: string | null = null
  if (body.parentId !== undefined && body.parentId !== null) {
    if (typeof body.parentId !== 'string') return fail('Invalid reply.')
    const parent = await prisma.comment.findUnique({ where: { id: body.parentId } })
    if (!parent || parent.contentType !== 'DEVOTION' || parent.contentId !== devotion.id) return fail('Invalid reply.')
    if (parent.deletedAt || parent.isHidden) return fail('That comment is no longer available.')
    parentId = parent.parentId ?? parent.id // threads stay one level deep
  }

  const comment = await prisma.comment.create({
    data: { userId: session.user.id, contentType: 'DEVOTION', contentId: devotion.id, content, parentId },
    select: { id: true },
  })
  return json(comment, 201)
}
