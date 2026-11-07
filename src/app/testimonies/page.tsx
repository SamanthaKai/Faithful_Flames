export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedTestimonies } from '@/lib/testimonies'
import { excerpt } from '@/lib/devotions'
import { TestimonyForm } from '@/components/TestimonyForm'

export const metadata: Metadata = { title: 'Testimonies', description: 'Stories of God’s faithfulness, told around the fire.' }

export default async function TestimoniesPage() {
  const testimonies = await getPublishedTestimonies()

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-20">
      <p className="kicker mb-3">Told around the fire</p>
      <h1 className="max-w-2xl font-heading text-4xl font-bold leading-tight text-lm-text dark:text-[#FFF4E8] md:text-6xl">
        What God has done.
      </h1>
      <p className="mt-5 max-w-xl leading-relaxed text-lm-muted dark:text-[#BFAEA3]">
        &ldquo;They triumphed over him by the blood of the Lamb and by the word of their testimony.&rdquo; (Revelation
        12:11) These are the stories this community has told.
      </p>
      <a href="#share" className="btn-ember mt-8">Share your testimony</a>

      <section className="mt-16" aria-label="Testimonies">
        {testimonies.length === 0 ? (
          <p className="text-lm-muted dark:text-[#BFAEA3]">No testimonies have been published yet. Yours could be the first.</p>
        ) : (
          <ol className="border-t border-lm-border dark:border-ember/10">
            {testimonies.map((t, i) => (
              <li key={t.id}>
                <Link
                  href={`/testimonies/${t.id}`}
                  className="group grid gap-2 border-b border-lm-border py-8 dark:border-ember/10 sm:grid-cols-[64px_1fr_auto] sm:gap-6"
                >
                  <span className="font-heading text-sm italic text-lm-muted dark:text-[#BFAEA3]">
                    № {String(testimonies.length - i).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-heading text-2xl font-bold leading-snug text-lm-text group-hover:text-ember dark:text-[#FFF4E8] md:text-3xl">
                      {t.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-lm-muted dark:text-[#BFAEA3]">{excerpt(t.content, 180)}</p>
                  </div>
                  <span className="self-end text-xs font-semibold text-lm-muted dark:text-[#BFAEA3] sm:text-right">
                    {t.author ?? 'Anonymous'}
                    <span className="block font-normal">{new Date(t.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section id="share" className="mt-20 scroll-mt-24 grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="kicker mb-3">Your turn</p>
          <h2 className="font-heading text-3xl font-bold text-lm-text dark:text-[#FFF4E8]">Add your story to the fire</h2>
          <p className="mt-4 text-sm leading-relaxed text-lm-muted dark:text-[#BFAEA3]">
            A healed body, a restored friendship, peace in a hard season, a quiet answer to prayer. Small or large,
            your story could be what someone else needs to hear today.
          </p>
        </div>
        <TestimonyForm />
      </section>
    </div>
  )
}
