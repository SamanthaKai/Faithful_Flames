export const dynamic = 'force-dynamic'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Devotions' }

export default async function DevotionsPage() {
  const devotions = await prisma.devotion.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="section-title text-4xl mb-3">Devotions</h1>
        <p className="text-warm-gray max-w-xl mx-auto">
          Short, focused devotionals to start your day grounded in Scripture, prayer, and reflection.
        </p>
      </div>

      <div className="space-y-6">
        {devotions.map((devotion) => (
          <Link key={devotion.id} href={`/devotions/${devotion.id}`} className="card p-6 md:p-8 block group">
            <div className="flex items-center gap-2 mb-3">
              <span className="tag bg-secondary/10 text-secondary">Devotion</span>
              <span className="text-xs text-warm-gray">
                {new Date(devotion.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-charcoal dark:text-cream group-hover:text-primary transition-colors mb-2">
              {devotion.title}
            </h2>
            <p className="text-primary text-sm font-medium mb-3 italic">{devotion.scripture}</p>
            <p className="text-warm-gray text-sm line-clamp-3 leading-relaxed">{devotion.teaching}</p>
            <span className="text-secondary text-sm font-semibold mt-4 inline-block">Read devotion →</span>
          </Link>
        ))}

        {devotions.length === 0 && (
          <div className="text-center py-16 text-warm-gray">
            <p className="text-lg">No devotions yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
