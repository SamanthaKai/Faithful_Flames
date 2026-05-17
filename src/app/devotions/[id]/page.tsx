import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const devotion = await prisma.devotion.findUnique({ where: { id: params.id } })
  return { title: devotion?.title ?? 'Devotion' }
}

export default async function DevotionPage({ params }: { params: { id: string } }) {
  const devotion = await prisma.devotion.findUnique({ where: { id: params.id, isPublished: true } })
  if (!devotion) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <Link href="/devotions" className="text-sm text-warm-gray hover:text-primary transition-colors mb-6 inline-flex items-center gap-1">
        ← Back to Devotions
      </Link>
      <article>
        <header className="mb-8">
          <span className="tag bg-secondary/10 text-secondary mb-4 inline-block">Devotion</span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal dark:text-cream mb-4">{devotion.title}</h1>
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg px-5 py-4 mb-6">
            <p className="text-primary font-semibold text-sm mb-1">Scripture</p>
            <p className="font-heading text-lg text-charcoal dark:text-cream italic">{devotion.scripture}</p>
          </div>
        </header>

        <section className="mb-8">
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-3">Reflection</h2>
          {devotion.teaching.split('\n\n').map((para, i) => (
            <p key={i} className="text-charcoal dark:text-cream/90 leading-relaxed mb-4">{para}</p>
          ))}
        </section>

        <section className="card p-6 mb-6 bg-secondary/5 border-secondary/20">
          <h2 className="font-heading text-lg font-bold text-secondary mb-2">Prayer Point</h2>
          <p className="text-charcoal dark:text-cream/90 leading-relaxed italic">{devotion.prayerPoint}</p>
        </section>

        <section className="card p-6 bg-primary/5 border-primary/20">
          <h2 className="font-heading text-lg font-bold text-primary mb-2">Reflection Question</h2>
          <p className="text-charcoal dark:text-cream/90 leading-relaxed">{devotion.reflectionQuestion}</p>
        </section>
      </article>
    </div>
  )
}
