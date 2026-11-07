export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublishedTestimony } from '@/lib/testimonies'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const t = await getPublishedTestimony(params.id)
  return { title: t?.title ?? 'Testimony' }
}

export default async function TestimonyPage({ params }: { params: { id: string } }) {
  const t = await getPublishedTestimony(params.id)
  if (!t) notFound()
  const paras = t.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20 animate-fade-in">
      <Link href="/testimonies" className="text-sm font-semibold text-lm-muted hover:text-ember dark:text-[#BFAEA3]">← All testimonies</Link>
      <header className="mt-10">
        <p className="kicker mb-4">A testimony</p>
        <h1 className="font-heading text-4xl font-bold leading-[1.12] text-lm-text dark:text-[#FFF4E8] md:text-5xl">{t.title}</h1>
        <p className="mt-6 text-sm text-lm-muted dark:text-[#BFAEA3]">
          Told by <strong className="text-lm-text dark:text-[#FFF4E8]">{t.author ?? 'Anonymous'}</strong> ·{' '}
          {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </header>
      <div className="ember-rule" />
      <div className="prose-fire drop-cap">
        {paras.map((p, i) => <p key={i} className="whitespace-pre-wrap">{p}</p>)}
      </div>
      <footer className="mt-14 panel flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="scripture text-lg text-lm-text dark:text-[#FFF4E8]">Has God been faithful to you too?</p>
        <Link href="/testimonies#share" className="btn-ember !py-2.5 text-xs">Share your testimony</Link>
      </footer>
    </article>
  )
}
