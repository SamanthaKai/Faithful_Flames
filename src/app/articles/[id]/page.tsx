export const dynamic = 'force-dynamic'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LikeButton } from '@/components/LikeButton'
import { CommentsSection } from '@/components/CommentsSection'
import { ArticleActions } from '@/components/ArticleActions'

function renderContent(content: string) {
  return content.split('\n\n').map((block, i) => {
    const t = block.trim()
    if (t.startsWith('# '))   return <h1 key={i} className="font-heading text-3xl font-bold text-charcoal dark:text-cream mt-10 mb-4">{t.slice(2)}</h1>
    if (t.startsWith('## '))  return <h2 key={i} className="font-heading text-2xl font-bold text-charcoal dark:text-cream mt-10 mb-3">{t.slice(3)}</h2>
    if (t.startsWith('### ')) return <h3 key={i} className="font-heading text-xl font-semibold text-charcoal dark:text-cream mt-8 mb-2">{t.slice(4)}</h3>
    return <p key={i} className="text-charcoal dark:text-cream/90 leading-relaxed mb-5">{t}</p>
  })
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { id: params.id } })
  return { title: article?.title ?? 'Article' }
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const [article, session] = await Promise.all([
    prisma.article.findUnique({ where: { id: params.id, isPublished: true } }),
    getServerSession(authOptions),
  ])
  if (!article) notFound()

  const canEdit = !!session?.user

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <Link href="/articles" className="text-sm text-warm-gray hover:text-primary transition-colors mb-6 inline-flex items-center gap-1">
        ← Back to Articles
      </Link>
      <article>
        <header className="mb-8">
          <span className="tag mb-4 inline-block">{article.category}</span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal dark:text-cream leading-tight mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-warm-gray text-sm">
              Published {new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <LikeButton contentType="ARTICLE" contentId={article.id} />
          </div>
        </header>
        <div className="prose-faithful">
          {renderContent(article.content)}
        </div>
      </article>
      {canEdit && <ArticleActions article={{ id: article.id, title: article.title, content: article.content, category: article.category }} />}
      <CommentsSection contentType="ARTICLE" contentId={article.id} />
    </div>
  )
}
