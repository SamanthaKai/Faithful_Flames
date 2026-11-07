import { prisma } from './prisma'

export type PublicTestimony = {
  id: string
  title: string
  content: string
  author: string | null
  createdAt: string
}

const select = {
  id: true,
  title: true,
  content: true,
  displayName: true,
  isAnonymous: true,
  createdAt: true,
  user: { select: { name: true } },
} as const

type Row = { id: string; title: string | null; content: string; displayName: string | null; isAnonymous: boolean; createdAt: Date; user: { name: string | null } | null }

function toPublic(t: Row): PublicTestimony {
  return {
    id: t.id,
    title: t.title?.trim() || firstLine(t.content),
    content: t.content,
    author: t.isAnonymous ? null : t.displayName?.trim() || t.user?.name?.trim() || null,
    createdAt: t.createdAt.toISOString(),
  }
}

function firstLine(content: string) {
  const s = content.replace(/\s+/g, ' ').trim()
  return s.length > 60 ? s.slice(0, s.lastIndexOf(' ', 60)) + '…' : s
}

export async function getPublishedTestimonies(take?: number) {
  const rows = await prisma.testimony.findMany({ where: { isApproved: true }, orderBy: { createdAt: 'desc' }, take, select })
  return rows.map(toPublic)
}

export async function getPublishedTestimony(id: string) {
  const row = await prisma.testimony.findFirst({ where: { id, isApproved: true }, select })
  return row ? toPublic(row) : null
}
