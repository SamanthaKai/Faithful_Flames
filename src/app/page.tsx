export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getHomeData() {
  const [verse, article, devotion, events, memberCount] = await Promise.all([
    prisma.verse.findFirst({ where: { isDaily: true } }).then(
      (v) => v ?? prisma.verse.findFirst({ orderBy: { createdAt: 'desc' } })
    ),
    prisma.article.findFirst({ where: { isPublished: true }, orderBy: { publishedAt: 'desc' } }),
    prisma.devotion.findFirst({ where: { isPublished: true }, orderBy: { publishedAt: 'desc' } }),
    prisma.event.findMany({ where: { date: { gte: new Date() } }, orderBy: { date: 'asc' }, take: 4 }),
    prisma.user.count(),
  ])
  return { verse, article, devotion, events, memberCount }
}

export default async function HomePage() {
  const [session, { verse, article, devotion, events, memberCount }] = await Promise.all([
    getServerSession(authOptions),
    getHomeData(),
  ])

  const firstName = session?.user?.name?.split(' ')[0] ?? null

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[#7a1f12] to-[#5a1508] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-400 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <div className="flex justify-center mb-6">
            <Image src="/favicon.png" alt="Faithful Flames" width={72} height={72} className="object-contain drop-shadow-lg" priority />
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight mb-4">
            {firstName ? `Welcome back, ${firstName}!` : 'Welcome to Faithful Flames'}
          </h1>
          <p className="text-xl md:text-2xl font-light text-orange-100 mb-3">
            Ignite your faith. Find your people.
          </p>
          <p className="text-base md:text-lg text-orange-200/80 max-w-xl mx-auto mb-10">
            A community for young Christians to grow deeper in God, share their stories, and walk this journey together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/forum" className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-white text-primary font-bold rounded-xl hover:bg-orange-50 transition-colors duration-200 shadow-lg">
              {session ? 'Go to Forum' : 'Join the Forum'}
            </Link>
            {!session && (
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-7 py-3 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors duration-200">
                Create Account
              </Link>
            )}
            {session && (
              <Link href="/profile" className="inline-flex items-center justify-center gap-2 px-7 py-3 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors duration-200">
                My Profile
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Verse of the Day */}
        {verse && (
          <section className="animate-slide-up">
            <div className="text-center mb-6">
              <span className="tag text-sm px-3 py-1">Verse of the Day</span>
            </div>
            <div className="max-w-3xl mx-auto card p-8 md:p-10 text-center">
              <svg className="w-8 h-8 text-primary/30 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              <p className="font-heading text-xl md:text-2xl text-charcoal dark:text-cream leading-relaxed mb-4 italic">
                {verse.text}
              </p>
              <p className="font-semibold text-primary text-base mb-6">— {verse.reference}</p>
              {verse.reflection && (
                <p className="text-warm-gray text-sm leading-relaxed max-w-xl mx-auto">{verse.reflection}</p>
              )}
            </div>
          </section>
        )}

        {/* Latest Content */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Latest from the Community</h2>
            <Link href="/articles" className="text-sm text-primary hover:text-secondary font-semibold transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {article && (
              <Link href={`/articles/${article.id}`} className="card p-6 block group">
                <span className="tag mb-3 block w-fit">{article.category}</span>
                <h3 className="font-heading text-xl font-bold text-charcoal dark:text-cream group-hover:text-primary transition-colors mb-2 leading-snug">
                  {article.title}
                </h3>
                <p className="text-warm-gray text-sm line-clamp-3">{article.content}</p>
                <span className="text-primary text-sm font-semibold mt-4 block">Read article →</span>
              </Link>
            )}
            {devotion && (
              <Link href={`/devotions/${devotion.id}`} className="card p-6 block group">
                <span className="tag mb-3 block w-fit bg-secondary/10 text-secondary">Devotion</span>
                <h3 className="font-heading text-xl font-bold text-charcoal dark:text-cream group-hover:text-primary transition-colors mb-2 leading-snug">
                  {devotion.title}
                </h3>
                <p className="text-warm-gray text-sm italic mb-2">{devotion.scripture}</p>
                <p className="text-warm-gray text-sm line-clamp-3">{devotion.teaching}</p>
                <span className="text-secondary text-sm font-semibold mt-4 block">Read devotion →</span>
              </Link>
            )}
          </div>
        </section>

        {/* Events */}
        {events.length > 0 && (
          <section>
            <h2 className="section-title mb-6">Upcoming Events</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {events.map((event) => (
                <div key={event.id} className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                      <span className="text-primary text-xs font-bold leading-none">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-primary text-sm font-bold leading-none">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-charcoal dark:text-cream text-sm truncate">{event.title}</p>
                      <p className="text-warm-gray text-xs">
                        {new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-warm-gray text-xs leading-relaxed">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="section-title mb-3">Ready to Connect?</h2>
          <p className="text-warm-gray mb-6 max-w-lg mx-auto">
            Join thousands of young believers sharing their journey, asking questions, and growing together.
          </p>
          <Link href="/forum" className="btn-primary text-base px-8 py-3">
            Join the Forum
          </Link>

          {/* Live community count */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/forum"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#231E1E] border border-gray-200 dark:border-[#3A3030] shadow-sm hover:border-primary/40 hover:shadow-md transition-all text-sm font-medium text-charcoal dark:text-cream"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span>
                <span className="font-bold text-primary">{memberCount.toLocaleString()}</span>
                {' '}{memberCount === 1 ? 'member' : 'members'} in the community
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
