export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { excerpt } from '@/lib/devotions'

export const metadata: Metadata = { title: 'Articles' }

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({ where: { isPublished: true }, orderBy: { publishedAt: 'desc' } })

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
      <p className="kicker mb-3">Further reading</p>
      <h1 className="font-heading text-4xl font-bold text-lm-text dark:text-[#FFF4E8] md:text-5xl">Articles</h1>
      <p className="mt-4 max-w-xl text-lm-muted dark:text-[#BFAEA3]">Longer pieces to read alongside the daily devotions.</p>

      {articles.length === 0 ? (
        <p className="mt-12 text-lm-muted dark:text-[#BFAEA3]">No articles yet.</p>
      ) : (
        <ul className="mt-12 border-t border-lm-border dark:border-ember/10">
          {articles.map((a) => (
            <li key={a.id}>
              <Link href={`/articles/${a.id}`} className="group block border-b border-lm-border py-7 dark:border-ember/10">
                <p className="kicker mb-2">{a.category}</p>
                <h2 className="font-heading text-2xl font-bold text-lm-text group-hover:text-ember dark:text-[#FFF4E8]">{a.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-lm-muted dark:text-[#BFAEA3]">
                  {excerpt(a.content.replace(/^#+\s/gm, ''), 200)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
