export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { fail, isResponse, json, readBody, requireAdmin, text } from '@/lib/api'

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  })
  return json(articles)
}

// Admin only.
export async function POST(req: Request) {
  const session = await requireAdmin()
  if (isResponse(session)) return session
  const body = await readBody(req)
  const title = text(body.title, { min: 3, max: 160 })
  const content = text(body.content, { min: 20, max: 50_000 })
  const category = text(body.category, { min: 2, max: 40 })
  if (!title || !content || !category) return fail('Title, category and content are required.')
  const article = await prisma.article.create({
    data: { title, content, category, isPublished: body.isPublished !== false, authorId: session.user.id },
  })
  return json(article, 201)
}
