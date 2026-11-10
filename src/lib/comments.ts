import { prisma } from './prisma'
import { devotionDay } from './day'

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
  likes: number
  likedByMe: boolean
  replies: PublicComment[]
}

export type Discussion = {
  day: string
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

  const ids = rows.map((r) => r.id)
  const [likeCounts, myLikes] = ids.length
    ? await Promise.all([
        prisma.like.groupBy({ by: ['contentId'], where: { contentType: 'COMMENT', contentId: { in: ids } }, _count: { _all: true } }),
        viewer
          ? prisma.like.findMany({ where: { userId: viewer.id, contentType: 'COMMENT', contentId: { in: ids } }, select: { contentId: true } })
          : Promise.resolve([]),
      ])
    : [[], []]
  const likeMap = new Map(likeCounts.map((l) => [l.contentId, l._count._all]))
  const mine = new Set(myLikes.map((l) => l.contentId))

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
      likes: removed ? 0 : likeMap.get(c.id) ?? 0,
      likedByMe: mine.has(c.id),
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

  return {
    day: devotionDay(devotion),
    count: rows.filter((r) => !r.deletedAt && !r.isHidden).length,
    comments,
  }
}
