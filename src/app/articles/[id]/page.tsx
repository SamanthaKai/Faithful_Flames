import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { id: params.id } })
  return { title: article?.title ?? 'Article' }
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({ where: { id: params.id, isPublished: true } })
  if (!article) notFound()

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
          <p className="text-warm-gray text-sm">
            Published {new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>
        <div className="prose-faithful">
          {article.content.split('\n\n').map((para, i) => (
            <p key={i} className="text-charcoal dark:text-cream/90 leading-relaxed mb-4">{para}</p>
          ))}
        </div>
      </article>
    </div>
  )
}
