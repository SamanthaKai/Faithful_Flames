export const dynamic = 'force-dynamic'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Articles' }

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="section-title text-4xl mb-3">Articles</h1>
        <p className="text-warm-gray max-w-xl mx-auto">
          Long-form writings on faith, culture, and the Christian life — written to challenge and encourage.
        </p>
      </div>

      <div className="space-y-6">
        {articles.map((article) => (
          <Link key={article.id} href={`/articles/${article.id}`} className="card p-6 md:p-8 block group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="tag mb-3 inline-block">{article.category}</span>
                <h2 className="font-heading text-xl md:text-2xl font-bold text-charcoal dark:text-cream group-hover:text-primary transition-colors mb-2 leading-snug">
                  {article.title}
                </h2>
                <p className="text-warm-gray text-sm leading-relaxed line-clamp-3 mb-4">{article.content}</p>
                <div className="flex items-center gap-4 text-xs text-warm-gray">
                  <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="text-primary font-semibold">Read article →</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {articles.length === 0 && (
          <div className="text-center py-16 text-warm-gray">
            <p className="text-lg">No articles published yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
