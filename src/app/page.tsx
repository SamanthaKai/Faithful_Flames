export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EmberParticles } from '@/components/EmberParticles'
import { ScrollReveal } from '@/components/ScrollReveal'
import { PrayButton } from '@/components/PrayButton'

async function getHomeData() {
  const [verse, article, devotion, testimony, prayerPosts, discussions] = await Promise.all([
    prisma.verse.findFirst({ where: { isDaily: true } }).then(
      (v) => v ?? prisma.verse.findFirst({ orderBy: { createdAt: 'desc' } })
    ),
    prisma.article.findFirst({ where: { isPublished: true }, orderBy: { publishedAt: 'desc' } }),
    prisma.devotion.findFirst({ where: { isPublished: true }, orderBy: { publishedAt: 'desc' } }),
    prisma.testimony.findFirst({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
    prisma.forumPost.findMany({
      where: { topic: 'PRAYER_REQUESTS', isFlagged: false },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { replies: { select: { id: true } } },
    }),
    prisma.forumPost.findMany({
      where: { isFlagged: false },
      orderBy: { createdAt: 'desc' },
      take: 2,
      include: { user: { select: { name: true } }, replies: { select: { id: true } } },
    }),
  ])
  return { verse, article, devotion, testimony, prayerPosts, discussions }
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default async function HomePage() {
  const [session, { verse, article, devotion, testimony, prayerPosts, discussions }] =
    await Promise.all([getServerSession(authOptions), getHomeData()])

  const firstName = session?.user?.name?.split(' ')[0] ?? null

  return (
    <div className="bg-[#0D0A0A] text-[#FFF4E8]">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/faithful.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />

        {/* Layered dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0A0A] via-transparent to-transparent" />

        {/* Warm ember glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#FF7A29]/12 to-transparent" />

        {/* Floating ember particles */}
        <EmberParticles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — headline */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF7A29]/15 border border-[#FF7A29]/25 text-[#F6B25E] text-sm font-medium mb-8">
                🔥 A digital campfire for young believers
              </div>

              {firstName && (
                <p className="text-[#BFAEA3] text-lg mb-3">
                  Welcome back, <span className="text-[#F6B25E] font-semibold">{firstName}</span>
                </p>
              )}

              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] mb-6 text-[#FFF4E8]">
                Faith grows<br />
                <span className="text-[#FF7A29]">stronger</span><br />
                together.
              </h1>

              <p className="text-lg text-[#BFAEA3] leading-relaxed max-w-lg mb-10">
                A place for young believers to pray, share, learn, and walk with God together.
              </p>

              <div className="flex flex-wrap gap-4">
                {session ? (
                  <>
                    <Link
                      href="/forum"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF7A29] text-white font-bold rounded-2xl hover:bg-[#F6B25E] hover:text-[#0D0A0A] transition-all duration-300 shadow-lg shadow-[#FF7A29]/20"
                    >
                      Join Fellowship
                    </Link>
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#FFF4E8]/20 text-[#FFF4E8] font-semibold rounded-2xl hover:bg-[#FFF4E8]/10 transition-all duration-300"
                    >
                      My Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF7A29] text-white font-bold rounded-2xl hover:bg-[#F6B25E] hover:text-[#0D0A0A] transition-all duration-300 shadow-lg shadow-[#FF7A29]/20"
                    >
                      Join Fellowship
                    </Link>
                    <Link
                      href="/forum"
                      className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#FFF4E8]/20 text-[#FFF4E8] font-semibold rounded-2xl hover:bg-[#FFF4E8]/10 transition-all duration-300"
                    >
                      Explore Community
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right — floating glass cards */}
            <div className="hidden lg:flex flex-col gap-4 animate-slide-up">
              {/* Verse card */}
              {verse ? (
                <div className="glass-card-static ember-glow p-6 animate-float">
                  <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-3">
                    📖 Verse of the Day
                  </p>
                  <p className="font-heading text-base text-[#FFF4E8] italic leading-relaxed line-clamp-3">
                    &ldquo;{verse.text}&rdquo;
                  </p>
                  <p className="text-xs text-[#BFAEA3] mt-3 font-medium">— {verse.reference}</p>
                </div>
              ) : (
                <div className="glass-card-static ember-glow p-6 animate-float">
                  <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-3">
                    📖 Verse of the Day
                  </p>
                  <p className="font-heading text-base text-[#FFF4E8] italic leading-relaxed">
                    &ldquo;Be strong and courageous. Do not be afraid; do not be discouraged.&rdquo;
                  </p>
                  <p className="text-xs text-[#BFAEA3] mt-3 font-medium">— Joshua 1:9</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Prayer counter */}
                <div className="glass-card-static gold-glow p-5 animate-float-delayed">
                  <p className="text-xs text-[#F6B25E] font-semibold uppercase tracking-widest mb-2">
                    🙏 Prayers
                  </p>
                  <p className="text-3xl font-bold text-[#FFF4E8]">
                    {prayerPosts.length > 0 ? prayerPosts.length : '∞'}
                  </p>
                  <p className="text-xs text-[#BFAEA3] mt-1">Active requests</p>
                </div>

                {/* Community card */}
                <div className="glass-card-static p-5 animate-float-slow">
                  <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-2">
                    🔥 Community
                  </p>
                  <p className="text-3xl font-bold text-[#FFF4E8]">Live</p>
                  <p className="text-xs text-[#BFAEA3] mt-1">Growing together</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#BFAEA3]/50 animate-glow-pulse">
          <p className="text-xs tracking-widest uppercase">Scroll</p>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── COMMUNITY CARDS ──────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <span className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest">Community</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mt-3 text-[#FFF4E8]">
            Where faith comes alive
          </h2>
          <p className="text-[#BFAEA3] mt-4 max-w-xl mx-auto leading-relaxed">
            Testimonies, prayers, and devotions shared by people just like you.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">

          {/* A. Testimony card */}
          <ScrollReveal delay="0s">
            <div className="glass-card ember-glow ember-border-left p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest bg-[#FF7A29]/10 px-3 py-1 rounded-full">
                  🔥 Testimony
                </span>
                <span className="text-lg">✝</span>
              </div>

              {testimony ? (
                <>
                  <p className="font-heading text-[#FFF4E8] text-base leading-relaxed italic flex-1 line-clamp-5">
                    &ldquo;{testimony.content}&rdquo;
                  </p>
                  <div className="mt-5 pt-4 border-t border-[#FF7A29]/10 flex items-center justify-between">
                    <p className="text-xs text-[#BFAEA3]">
                      By {testimony.isAnonymous ? 'Anonymous' : (testimony.user.name ?? 'A believer')}
                    </p>
                    <p className="text-xs text-[#BFAEA3]">{timeAgo(testimony.createdAt)}</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-heading text-[#FFF4E8] text-base leading-relaxed italic flex-1">
                    &ldquo;Your testimony could help someone tonight. Every story of God&apos;s grace matters here.&rdquo;
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/testimonies"
                      className="inline-flex items-center gap-1 text-sm text-[#FF7A29] font-semibold hover:text-[#F6B25E] transition-colors"
                    >
                      Share your story →
                    </Link>
                  </div>
                </>
              )}
            </div>
          </ScrollReveal>

          {/* B. Prayer Request card */}
          <ScrollReveal delay="0.12s">
            <div className="glass-card-gold gold-glow gold-border-left p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#F6B25E] font-semibold uppercase tracking-widest bg-[#F6B25E]/10 px-3 py-1 rounded-full">
                  🙏 Prayer Request
                </span>
              </div>

              {prayerPosts[0] ? (
                <>
                  <p className="font-heading text-[#FFF4E8] text-base leading-relaxed italic flex-1 line-clamp-4">
                    &ldquo;{prayerPosts[0].content}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-xs text-[#BFAEA3]">
                      {prayerPosts[0].replies.length} praying
                    </p>
                    <PrayButton />
                  </div>
                </>
              ) : (
                <>
                  <p className="font-heading text-[#FFF4E8] text-base leading-relaxed italic flex-1">
                    &ldquo;Be the first to lift someone up in prayer today. Every intercession counts.&rdquo;
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/forum"
                      className="inline-flex items-center gap-1 text-sm text-[#F6B25E] font-semibold hover:text-[#FFF4E8] transition-colors"
                    >
                      Post a prayer request →
                    </Link>
                  </div>
                </>
              )}
            </div>
          </ScrollReveal>

          {/* C. Daily Verse / Devotion card */}
          <ScrollReveal delay="0.24s">
            <div className="glass-card ember-glow p-6 h-full flex flex-col text-center items-center justify-center">
              <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-5">
                📖 Daily Verse
              </p>
              {verse ? (
                <>
                  <p className="font-heading text-[#FFF4E8] text-xl leading-relaxed italic scripture-glow flex-1 flex items-center">
                    &ldquo;{verse.text.length > 120 ? verse.text.slice(0, 120) + '…' : verse.text}&rdquo;
                  </p>
                  <p className="text-[#F6B25E] font-semibold text-sm mt-5">{verse.reference}</p>
                </>
              ) : (
                <>
                  <p className="font-heading text-[#FFF4E8] text-xl leading-relaxed italic scripture-glow flex-1 flex items-center">
                    &ldquo;I can do all things through Christ who strengthens me.&rdquo;
                  </p>
                  <p className="text-[#F6B25E] font-semibold text-sm mt-5">Philippians 4:13</p>
                </>
              )}
              <Link
                href="/verses"
                className="mt-5 text-xs text-[#BFAEA3] hover:text-[#FF7A29] transition-colors"
              >
                More verses →
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Second row — Discussion + Article/Devotion cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">

          {/* D. Discussion card */}
          <ScrollReveal delay="0s">
            {discussions[0] ? (
              <Link href={`/forum/${discussions[0].id}`} className="block">
                <div className="glass-card ember-glow p-6 h-full">
                  <span className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest bg-[#FF7A29]/10 px-3 py-1 rounded-full">
                    💬 Discussion
                  </span>
                  <h3 className="font-heading text-[#FFF4E8] text-lg font-bold mt-4 mb-3 leading-snug">
                    {discussions[0].title}
                  </h3>
                  <p className="text-[#BFAEA3] text-sm line-clamp-2">{discussions[0].content}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-[#BFAEA3]">
                    <span>💬 {discussions[0].replies.length} replies</span>
                    <span className="text-[#FF7A29] font-semibold">Trending now</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="glass-card ember-glow p-6 h-full">
                <span className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest bg-[#FF7A29]/10 px-3 py-1 rounded-full">
                  💬 Discussion
                </span>
                <h3 className="font-heading text-[#FFF4E8] text-lg font-bold mt-4 mb-3">
                  What does trusting God daily look like?
                </h3>
                <p className="text-[#BFAEA3] text-sm">
                  Be the first to start a conversation. Your questions and reflections help others grow.
                </p>
                <Link href="/forum" className="mt-4 inline-flex items-center gap-1 text-sm text-[#FF7A29] font-semibold hover:text-[#F6B25E] transition-colors">
                  Start a discussion →
                </Link>
              </div>
            )}
          </ScrollReveal>

          {/* E. Article / Devotion card */}
          <ScrollReveal delay="0.12s">
            {(article || devotion) ? (
              <Link href={article ? `/articles/${article.id}` : `/devotions/${devotion!.id}`} className="block">
                <div className="glass-card-gold gold-glow p-6 h-full">
                  <span className="text-xs text-[#F6B25E] font-semibold uppercase tracking-widest bg-[#F6B25E]/10 px-3 py-1 rounded-full">
                    {article ? `📝 ${article.category}` : '🕊 Devotion'}
                  </span>
                  <h3 className="font-heading text-[#FFF4E8] text-lg font-bold mt-4 mb-3 leading-snug">
                    {article?.title ?? devotion?.title}
                  </h3>
                  {devotion && !article && (
                    <p className="text-[#F6B25E] text-xs italic mb-2">{devotion.scripture}</p>
                  )}
                  <p className="text-[#BFAEA3] text-sm line-clamp-2">
                    {article?.content ?? devotion?.teaching}
                  </p>
                  <p className="mt-4 text-sm text-[#F6B25E] font-semibold">Read more →</p>
                </div>
              </Link>
            ) : (
              <div className="glass-card-gold gold-glow p-6 h-full">
                <span className="text-xs text-[#F6B25E] font-semibold uppercase tracking-widest bg-[#F6B25E]/10 px-3 py-1 rounded-full">
                  📝 Articles & Devotions
                </span>
                <h3 className="font-heading text-[#FFF4E8] text-lg font-bold mt-4 mb-3">
                  Growing deeper, one day at a time.
                </h3>
                <p className="text-[#BFAEA3] text-sm">
                  Articles and devotions are being prepared. Check back soon for spirit-led content.
                </p>
                <Link href="/devotions" className="mt-4 inline-flex items-center gap-1 text-sm text-[#F6B25E] font-semibold hover:text-[#FFF4E8] transition-colors">
                  Browse devotions →
                </Link>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* ── PRAYER WALL ──────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <span className="text-xs text-[#F6B25E] font-semibold uppercase tracking-widest">Prayer Wall</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mt-3 text-[#FFF4E8]">
            Lifting each other up
          </h2>
          <p className="text-[#BFAEA3] mt-4 max-w-lg mx-auto leading-relaxed">
            Every prayer here is heard. Every name remembered.
          </p>
        </ScrollReveal>

        <div className="space-y-4">
          {prayerPosts.length > 0 ? (
            prayerPosts.map((post, i) => (
              <ScrollReveal key={post.id} delay={`${i * 0.1}s`}>
                <div className="glass-card-gold gold-glow p-6 flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#F6B25E] font-semibold uppercase tracking-widest mb-3">
                      🙏 Prayer Request
                    </p>
                    <p className="text-[#FFF4E8] text-sm leading-relaxed line-clamp-3">
                      &ldquo;{post.content}&rdquo;
                    </p>
                    <p className="text-xs text-[#BFAEA3] mt-3">
                      {post.replies.length} {post.replies.length === 1 ? 'person' : 'people'} praying · {timeAgo(post.createdAt)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <PrayButton />
                  </div>
                </div>
              </ScrollReveal>
            ))
          ) : (
            <ScrollReveal>
              <div className="glass-card-gold gold-glow p-8 text-center">
                <p className="text-4xl mb-4">🙏</p>
                <h3 className="font-heading text-[#FFF4E8] text-xl font-bold mb-2">
                  Be the first to share a prayer request
                </h3>
                <p className="text-[#BFAEA3] text-sm mb-6 max-w-sm mx-auto">
                  Someone out there needs to know they&apos;re not praying alone tonight.
                </p>
                <Link
                  href="/forum"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F6B25E]/15 text-[#F6B25E] border border-[#F6B25E]/25 font-semibold rounded-2xl hover:bg-[#F6B25E]/25 transition-all duration-300 text-sm"
                >
                  Post a prayer request
                </Link>
              </div>
            </ScrollReveal>
          )}
        </div>

        <ScrollReveal className="text-center mt-8">
          <Link href="/forum" className="text-sm text-[#BFAEA3] hover:text-[#FF7A29] transition-colors">
            View all prayer requests →
          </Link>
        </ScrollReveal>
      </section>

      {/* ── FEATURED SCRIPTURE ───────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background */}
        <Image
          src="/faithful.png"
          alt=""
          fill
          className="object-cover object-center opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A0A] via-[#0D0A0A]/60 to-[#0D0A0A]" />

        {/* Subtle light ray */}
        <div className="absolute inset-0 pointer-events-none ember-ray-glow" />

        <ScrollReveal className="relative z-10 text-center max-w-3xl mx-auto">
          <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-8">
            ✦ Verse of the Day ✦
          </p>
          <blockquote className="font-heading text-3xl md:text-5xl font-bold text-[#FFF4E8] leading-tight scripture-glow italic mb-8">
            &ldquo;{verse?.text ?? 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.'}&rdquo;
          </blockquote>
          <p className="text-[#F6B25E] text-xl font-semibold tracking-wide">
            {verse?.reference ?? 'Joshua 1:9'}
          </p>
          {verse?.reflection && (
            <p className="text-[#BFAEA3] mt-8 text-base leading-relaxed max-w-xl mx-auto">
              {verse.reflection}
            </p>
          )}
          <Link
            href="/verses"
            className="mt-10 inline-flex items-center gap-2 px-6 py-2.5 border border-[#FF7A29]/25 text-[#FF7A29] font-semibold rounded-2xl hover:bg-[#FF7A29]/10 transition-all duration-300 text-sm"
          >
            Explore all verses
          </Link>
        </ScrollReveal>
      </section>

      {/* ── FEATURED MEMBER ──────────────────────────────────── */}
      {discussions[1] && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="glass-card ember-glow p-8 md:p-12 text-center max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-full bg-[#FF7A29]/20 border border-[#FF7A29]/30 flex items-center justify-center text-2xl mx-auto mb-5">
                🌟
              </div>
              <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-4">
                Community Voice
              </p>
              <p className="font-heading text-[#FFF4E8] text-xl italic leading-relaxed mb-5">
                &ldquo;{discussions[1].title}&rdquo;
              </p>
              <p className="text-[#BFAEA3] text-sm">
                — {discussions[1].user.name ?? 'A fellow believer'}
              </p>
              <Link
                href={`/forum/${discussions[1].id}`}
                className="mt-6 inline-flex items-center gap-1 text-sm text-[#FF7A29] font-semibold hover:text-[#F6B25E] transition-colors"
              >
                Join the conversation →
              </Link>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* ── JOIN CTA ─────────────────────────────────────────── */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Warm glow backdrop */}
        <div className="absolute inset-0 pointer-events-none ember-cta-glow" />

        <ScrollReveal className="relative z-10 text-center max-w-2xl mx-auto">
          <span className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest">
            You belong here
          </span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold mt-4 mb-6 text-[#FFF4E8] leading-tight">
            Ready to walk this<br />
            <span className="text-[#FF7A29]">journey together?</span>
          </h2>
          <p className="text-[#BFAEA3] text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Join a community of young believers growing deeper in faith, one day at a time.
          </p>

          {session ? (
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/forum"
                className="inline-flex items-center gap-2 px-10 py-4 bg-[#FF7A29] text-white font-bold rounded-2xl hover:bg-[#F6B25E] hover:text-[#0D0A0A] transition-all duration-300 shadow-xl shadow-[#FF7A29]/20 text-base"
              >
                🔥 Go to Community
              </Link>
              <Link
                href="/testimonies"
                className="inline-flex items-center gap-2 px-10 py-4 border border-[#FFF4E8]/15 text-[#FFF4E8] font-semibold rounded-2xl hover:bg-[#FFF4E8]/8 transition-all duration-300 text-base"
              >
                Share your testimony
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-10 py-4 bg-[#FF7A29] text-white font-bold rounded-2xl hover:bg-[#F6B25E] hover:text-[#0D0A0A] transition-all duration-300 shadow-xl shadow-[#FF7A29]/20 text-base"
              >
                🔥 Join Faithful Flames
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-10 py-4 border border-[#FFF4E8]/15 text-[#FFF4E8] font-semibold rounded-2xl hover:bg-[#FFF4E8]/8 transition-all duration-300 text-base"
              >
                Sign in
              </Link>
            </div>
          )}

          <p className="text-[#BFAEA3]/50 text-sm mt-8 italic">
            &ldquo;For where two or three gather in my name, there am I with them.&rdquo; — Matthew 18:20
          </p>
        </ScrollReveal>
      </section>

    </div>
  )
}
