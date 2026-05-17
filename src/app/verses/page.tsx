export const dynamic = 'force-dynamic'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Daily Verses' }

export default async function VersesPage() {
  const verses = await prisma.verse.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="section-title text-4xl mb-3">Daily Verses</h1>
        <p className="text-warm-gray max-w-xl mx-auto">
          Scripture to anchor your soul — meditate, reflect, and carry these words with you throughout your day.
        </p>
      </div>

      <div className="space-y-6">
        {verses.map((verse) => (
          <article key={verse.id} className="card p-6 md:p-8">
            {verse.isDaily && (
              <span className="tag mb-3 inline-block">Today&apos;s Verse</span>
            )}
            <blockquote className="font-heading text-lg md:text-xl text-charcoal dark:text-cream italic leading-relaxed mb-3">
              &ldquo;{verse.text}&rdquo;
            </blockquote>
            <p className="font-semibold text-primary mb-4">— {verse.reference}</p>
            {verse.reflection && (
              <div className="border-l-2 border-primary/30 pl-4">
                <p className="text-sm text-warm-gray leading-relaxed">{verse.reflection}</p>
              </div>
            )}
            {verse.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {verse.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </article>
        ))}

        {verses.length === 0 && (
          <div className="text-center py-16 text-warm-gray">
            <p className="text-lg">No verses yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
