import { prisma } from './prisma'
import { endOfDay, devotionDay, isDiscussionOpen } from './day'

export const DISPLAY_FALLBACK = 'A friend by the fire'

export type PublicComment = {
  id: string
  parentId: string | null
  content: string
  removed: boolean
  hidden: boolean
  createdAt: string
  edited: boolean
  author: { id: string | null; name: string }
  isMine: boolean
  replies: PublicComment[]
}

export type Discussion = {
  open: boolean
  day: string
  closesAt: string
  count: number
  comments: PublicComment[]
}

/** Discussion for one devotion, as a one-level thread, safe to return publicly. */
export async function getDiscussion(
  devotion: { id: string; dayKey: string | null; publishedAt: Date },
  viewer: { id: string; role: string } | null,
): Promise<Discussion> {
  const isAdmin = viewer?.role === 'ADMIN'
  const rows = await prisma.comment.findMany({
    where: { contentType: 'DEVOTION', contentId: devotion.id },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, name: true } } },
  })

  const toPublic = (c: (typeof rows)[number]): PublicComment => {
    // Hidden comments are visible (marked) to admins only; deleted ones to no one.
    const removed = !!c.deletedAt || (c.isHidden && !isAdmin)
    return {
      id: c.id,
      parentId: c.parentId,
      content: removed ? '' : c.content,
      removed,
      hidden: c.isHidden,
      createdAt: c.createdAt.toISOString(),
      edited: c.updatedAt.getTime() - c.createdAt.getTime() > 5000 && !c.deletedAt,
      author: removed ? { id: null, name: '' } : { id: c.user.id, name: c.user.name?.trim() || DISPLAY_FALLBACK },
      isMine: !!viewer && viewer.id === c.userId,
      replies: [],
    }
  }

  const byId = new Map<string, PublicComment>()
  const roots: PublicComment[] = []
  for (const r of rows) byId.set(r.id, toPublic(r))
  for (const c of Array.from(byId.values())) {
    const parent = c.parentId ? byId.get(c.parentId) : null
    if (parent) parent.replies.push(c)
    else roots.push(c)
  }
  // Drop removed comments nobody replied to; keep a placeholder when others did.
  const comments = roots
    .map((r) => ({ ...r, replies: r.replies.filter((x) => !x.removed) }))
    .filter((r) => !r.removed || r.replies.length > 0)

  const day = devotionDay(devotion)
  return {
    open: isDiscussionOpen(devotion),
    day,
    closesAt: endOfDay(day).toISOString(),
    count: rows.filter((r) => !r.deletedAt && !r.isHidden).length,
    comments,
  }
}
