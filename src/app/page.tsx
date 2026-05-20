export const dynamic = 'force-dynamic'
import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EmberParticles } from '@/components/EmberParticles'
import { ScrollReveal } from '@/components/ScrollReveal'
import { FORUM_TOPIC_MAP } from '@/lib/forum-topics'

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getPublicVerse() {
  return prisma.verse.findFirst({ where: { isDaily: true } }).then(
    (v) => v ?? prisma.verse.findFirst({ orderBy: { createdAt: 'desc' } })
  )
}

async function getDashboardData(userId: string) {
  const [verse, feedPosts, prayerPosts, testimonies, events, profile] = await Promise.all([
    prisma.verse.findFirst({ where: { isDaily: true } }).then(
      (v) => v ?? prisma.verse.findFirst({ orderBy: { createdAt: 'desc' } })
    ),
    prisma.forumPost.findMany({
      where: { isFlagged: false },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        user: { select: { name: true, image: true } },
        replies: { select: { id: true } },
      },
    }),
    prisma.forumPost.findMany({
      where: { topic: 'PRAYER_REQUESTS', isFlagged: false },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.testimony.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { user: { select: { name: true } } },
    }),
    prisma.event.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 3,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        image: true,
        bio: true,
        favoriteVerse: true,
        _count: { select: { forumPosts: true, reflections: true } },
      },
    }),
  ])
  return { verse, feedPosts, prayerPosts, testimonies, events, profile }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good morning', emoji: '☀️' }
  if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' }
  return { text: 'Good evening', emoji: '🌙' }
}

const TOPIC_META = FORUM_TOPIC_MAP

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // ════════════════════════════════════════════════════════════════════════════
  // SIGNED IN — Community Dashboard
  // ════════════════════════════════════════════════════════════════════════════
  if (session?.user) {
    const data = await getDashboardData(session.user.id)
    const firstName = session.user.name?.split(' ')[0] ?? 'Friend'
    const { text: greeting, emoji } = getGreeting()

    type FeedPost      = typeof data.feedPosts[number]
    type FeedTestimony = typeof data.testimonies[number]
    type FeedEntry     = { kind: 'post'; item: FeedPost } | { kind: 'testimony'; item: FeedTestimony }

    const feed: FeedEntry[] = [
      ...data.feedPosts.map(p  => ({ kind: 'post'      as const, item: p })),
      ...data.testimonies.map(t => ({ kind: 'testimony' as const, item: t })),
    ]
      .sort((a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime())
      .slice(0, 10)

    return (
      <div className="bg-[#0D0A0A] text-[#FFF4E8] min-h-screen">

        {/* ── GREETING BAR ─────────────────────────────────── */}
        <div className="border-b border-[#FF7A29]/10 bg-[#161111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[#BFAEA3] text-sm mb-1">{greeting} {emoji}</p>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#FFF4E8]">{firstName}</h1>
              <p className="text-[#BFAEA3] mt-2 text-sm">How has your walk with God been today?</p>
            </div>
            {data.verse && (
              <div className="hidden md:block text-right max-w-xs">
                <p className="text-xs text-[#F6B25E] font-semibold uppercase tracking-widest mb-1">Today&apos;s word</p>
                <p className="text-[#BFAEA3] text-xs italic line-clamp-2">&ldquo;{data.verse.text}&rdquo;</p>
                <p className="text-[#F6B25E] text-xs mt-1">{data.verse.reference}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── QUICK ACTIONS ────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {([
              { href: '/testimonies', icon: '🔥', label: 'Share Testimony',  border: 'border-[#FF7A29]/25 hover:border-[#FF7A29]/50 from-[#FF7A29]/15 to-[#A63B1E]/5' },
              { href: '/forum',       icon: '🙏', label: 'Ask for Prayer',   border: 'border-[#F6B25E]/20 hover:border-[#F6B25E]/40 from-[#F6B25E]/10 to-[#A63B1E]/5' },
              { href: '/forum',       icon: '💬', label: 'Start Discussion', border: 'border-[#FF7A29]/20 hover:border-[#FF7A29]/40 from-[#FF7A29]/10 to-[#161111]'   },
              { href: '/reflections', icon: '📖', label: 'Write Reflection', border: 'border-[#F6B25E]/15 hover:border-[#F6B25E]/35 from-[#F6B25E]/8 to-[#161111]'    },
            ] as const).map(({ href, icon, label, border }) => (
              <Link
                key={label}
                href={href}
                className={`glass-card-static bg-gradient-to-br ${border} border p-5 text-center group transition-all duration-300 hover:-translate-y-1`}
              >
                <span className="text-3xl block mb-2">{icon}</span>
                <span className="text-sm font-semibold text-[#FFF4E8] group-hover:text-[#FF7A29] transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── 3-COLUMN DASHBOARD ───────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid lg:grid-cols-[260px_1fr_300px] gap-6">

            {/* LEFT SIDEBAR — Identity */}
            <aside className="hidden lg:block space-y-4">

              {/* Profile card */}
              <div className="glass-card-static ember-glow p-5">
                <div className="flex flex-col items-center text-center">
                  {session.user.image ? (
                    <Image src={session.user.image} alt="" width={56} height={56} className="rounded-full ring-2 ring-ember/30 mb-3" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-ember text-white flex items-center justify-center text-xl font-bold mb-3">
                      {session.user.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <p className="font-heading font-bold text-[#FFF4E8] text-lg leading-tight">{session.user.name}</p>
                  {data.profile?.bio && (
                    <p className="text-[#BFAEA3] text-xs mt-2 leading-relaxed line-clamp-2">{data.profile.bio}</p>
                  )}
                  {data.profile?.favoriteVerse && (
                    <p className="text-[#F6B25E] text-xs mt-2 italic line-clamp-2">✝ {data.profile.favoriteVerse}</p>
                  )}
                </div>
                {data.profile && (
                  <div className="flex justify-around mt-4 pt-4 border-t border-[#FF7A29]/10">
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#FFF4E8]">{data.profile._count.forumPosts}</p>
                      <p className="text-[#BFAEA3] text-xs">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#FFF4E8]">{data.profile._count.reflections}</p>
                      <p className="text-[#BFAEA3] text-xs">Reflections</p>
                    </div>
                  </div>
                )}
                <Link href="/profile" className="block mt-4 text-center text-xs text-[#FF7A29] hover:text-[#F6B25E] transition-colors font-semibold">
                  View full profile →
                </Link>
              </div>

              {/* Navigation */}
              <div className="glass-card-static p-4">
                <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-3">Navigate</p>
                {([
                  ['🔥', 'Community',     '/forum'],
                  ['📖', 'Verses',        '/verses'],
                  ['🕊', 'Devotions',     '/devotions'],
                  ['✝',  'Testimonies',   '/testimonies'],
                  ['📝', 'My Reflections','/reflections'],
                ] as const).map(([icon, label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 py-2 text-sm text-[#BFAEA3] hover:text-[#FF7A29] transition-colors"
                  >
                    <span className="w-4 text-center">{icon}</span>
                    <span>{label}</span>
                  </Link>
                ))}
              </div>

            </aside>

            {/* CENTER — Activity Feed */}
            <main className="space-y-4 min-w-0">
              <p className="text-xs text-[#BFAEA3] uppercase tracking-widest font-semibold pb-1 border-b border-[#FF7A29]/8 mb-4">
                Community Feed
              </p>

              {feed.length > 0 ? feed.map((entry) => {
                if (entry.kind === 'post') {
                  const post  = entry.item
                  const meta  = TOPIC_META[post.topic] ?? { label: post.topic, labelSingular: post.topic, icon: '💬', isPrayer: false, light: '', dark: '' }
                  return (
                    <Link key={`post-${post.id}`} href={`/forum/${post.id}`} className="block">
                      <div className={meta.isPrayer
                        ? 'glass-card-gold gold-border-left gold-glow p-5'
                        : 'glass-card ember-border-left ember-glow p-5'}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span className={`text-xs font-semibold uppercase tracking-widest ${meta.isPrayer ? 'text-[#F6B25E]' : 'text-[#FF7A29]'}`}>
                            {meta.icon} {meta.label}
                          </span>
                          <span className="text-xs text-[#BFAEA3] flex-shrink-0">{timeAgo(post.createdAt)}</span>
                        </div>
                        <h3 className="font-heading text-[#FFF4E8] font-bold leading-snug mb-2">{post.title}</h3>
                        <p className="text-[#BFAEA3] text-sm line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#BFAEA3]">
                          <span>By {post.user.name ?? 'Anonymous'}</span>
                          <span>💬 {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}</span>
                        </div>
                      </div>
                    </Link>
                  )
                }

                const testimony = entry.item
                return (
                  <Link key={`testimony-${testimony.id}`} href="/testimonies" className="block">
                    <div className="glass-card ember-border-left ember-glow p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest">🔥 Testimony</span>
                        <span className="text-xs text-[#BFAEA3] flex-shrink-0">{timeAgo(testimony.createdAt)}</span>
                      </div>
                      <p className="font-heading text-[#FFF4E8] italic leading-relaxed line-clamp-3">
                        &ldquo;{testimony.content}&rdquo;
                      </p>
                      <p className="text-xs text-[#BFAEA3] mt-3">
                        — {testimony.isAnonymous ? 'Anonymous' : (testimony.user.name ?? 'A believer')}
                      </p>
                    </div>
                  </Link>
                )
              }) : (
                <div className="glass-card ember-glow p-10 text-center">
                  <p className="text-4xl mb-4">🔥</p>
                  <h3 className="font-heading text-[#FFF4E8] text-xl font-bold mb-2">
                    Be the first voice in this fellowship
                  </h3>
                  <p className="text-[#BFAEA3] text-sm mb-6 max-w-sm mx-auto">
                    Your story, your questions, your prayers — they matter here.
                  </p>
                  <Link
                    href="/forum"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF7A29]/15 text-[#FF7A29] border border-[#FF7A29]/25 font-semibold rounded-2xl hover:bg-[#FF7A29]/25 transition-all duration-300 text-sm"
                  >
                    Start the conversation
                  </Link>
                </div>
              )}

              {feed.length > 0 && (
                <p className="text-center pt-2">
                  <Link href="/forum" className="text-sm text-[#BFAEA3] hover:text-[#FF7A29] transition-colors">
                    View all community posts →
                  </Link>
                </p>
              )}
            </main>

            {/* RIGHT SIDEBAR — Spiritual Dashboard */}
            <aside className="hidden lg:block space-y-4">

              {/* Verse of the Day */}
              <div className="glass-card-static ember-glow p-5">
                <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-4">📖 Verse of the Day</p>
                {data.verse ? (
                  <>
                    <p className="font-heading text-[#FFF4E8] text-sm italic leading-relaxed scripture-glow line-clamp-4">
                      &ldquo;{data.verse.text}&rdquo;
                    </p>
                    <p className="text-[#F6B25E] text-xs mt-3 font-semibold">{data.verse.reference}</p>
                  </>
                ) : (
                  <p className="font-heading text-[#FFF4E8] text-sm italic leading-relaxed">
                    &ldquo;Be strong and courageous. Do not be afraid.&rdquo;
                  </p>
                )}
                <Link href="/verses" className="block mt-3 text-xs text-[#BFAEA3] hover:text-[#FF7A29] transition-colors">
                  All verses →
                </Link>
              </div>

              {/* Active Prayer Requests */}
              <div className="glass-card-static gold-glow p-5">
                <p className="text-xs text-[#F6B25E] font-semibold uppercase tracking-widest mb-4">🙏 Active Prayers</p>
                {data.prayerPosts.length > 0 ? (
                  <div className="space-y-3">
                    {data.prayerPosts.map(post => (
                      <div key={post.id} className="border-b border-[#F6B25E]/8 pb-3 last:border-0 last:pb-0">
                        <p className="text-[#FFF4E8] text-xs leading-relaxed line-clamp-2">{post.content}</p>
                        <p className="text-[#BFAEA3] text-xs mt-1">{timeAgo(post.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#BFAEA3] text-xs leading-relaxed">
                    No active prayer requests yet. Be the first to share one.
                  </p>
                )}
                <Link href="/forum" className="block mt-3 text-xs text-[#F6B25E] hover:text-[#FFF4E8] transition-colors">
                  Post a prayer request →
                </Link>
              </div>

              {/* Upcoming Events */}
              {data.events.length > 0 && (
                <div className="glass-card-static ember-glow p-5">
                  <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-4">📅 Upcoming</p>
                  <div className="space-y-3">
                    {data.events.map(event => (
                      <div key={event.id} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FF7A29]/15 flex flex-col items-center justify-center flex-shrink-0 border border-[#FF7A29]/20">
                          <span className="text-[#FF7A29] text-[9px] font-bold leading-none uppercase">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-[#FF7A29] text-sm font-bold leading-none">
                            {new Date(event.date).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#FFF4E8] text-sm font-semibold truncate">{event.title}</p>
                          <p className="text-[#BFAEA3] text-xs">
                            {new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Pulse */}
              <div className="glass-card-static p-5">
                <p className="text-xs text-[#BFAEA3] font-semibold uppercase tracking-widest mb-4">Community Pulse</p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Discussions',     value: data.feedPosts.length,    icon: '💬' },
                    { label: 'Prayer requests', value: data.prayerPosts.length,  icon: '🙏' },
                    { label: 'Testimonies',     value: data.testimonies.length,  icon: '🔥' },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[#BFAEA3] text-sm">{icon} {label}</span>
                      <span className="text-[#FFF4E8] font-bold text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </aside>

          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SIGNED OUT — Cinematic Landing Page
  // ════════════════════════════════════════════════════════════════════════════
  const verse = await getPublicVerse()

  return (
    <div className="bg-[#0D0A0A] text-[#FFF4E8]">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <Image src="/faithful.png" alt="" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0A0A] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#FF7A29]/12 to-transparent" />
        <EmberParticles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — headline */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF7A29]/15 border border-[#FF7A29]/25 text-[#F6B25E] text-sm font-medium mb-8">
                🔥 A digital campfire for young believers
              </div>
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] mb-6 text-[#FFF4E8]">
                Faith grows<br />
                <span className="text-[#FF7A29]">stronger</span><br />
                together.
              </h1>
              <p className="text-lg text-[#BFAEA3] leading-relaxed max-w-lg mb-10">
                A place for young believers to pray, share, learn, and walk with God together.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF7A29] text-white font-bold rounded-2xl hover:bg-[#F6B25E] hover:text-[#0D0A0A] transition-all duration-300 shadow-lg shadow-[#FF7A29]/20">
                  Join Fellowship
                </Link>
                <Link href="/forum" className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#FFF4E8]/20 text-[#FFF4E8] font-semibold rounded-2xl hover:bg-[#FFF4E8]/10 transition-all duration-300">
                  Explore Community
                </Link>
              </div>
            </div>

            {/* Right — floating preview cards */}
            <div className="flex flex-col gap-4 animate-slide-up mt-12 lg:mt-0">
              <div className="glass-card-static ember-glow p-6 animate-float">
                <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-3">📖 Verse of the Day</p>
                <p className="font-heading text-base text-[#FFF4E8] italic leading-relaxed line-clamp-3">
                  &ldquo;{verse?.text ?? 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you.'}&rdquo;
                </p>
                <p className="text-xs text-[#BFAEA3] mt-3 font-medium">— {verse?.reference ?? 'Joshua 1:9'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card-static gold-glow p-5 animate-float-delayed">
                  <p className="text-xs text-[#F6B25E] font-semibold uppercase tracking-widest mb-2">🙏 Prayers</p>
                  <p className="text-3xl font-bold text-[#FFF4E8]">∞</p>
                  <p className="text-xs text-[#BFAEA3] mt-1">Active requests</p>
                </div>
                <div className="glass-card-static p-5 animate-float-slow">
                  <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-2">🔥 Community</p>
                  <p className="text-3xl font-bold text-[#FFF4E8]">Live</p>
                  <p className="text-xs text-[#BFAEA3] mt-1">Growing together</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#BFAEA3]/50 animate-glow-pulse">
          <p className="text-xs tracking-widest uppercase">Scroll</p>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── COMMUNITY PREVIEW ──────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <span className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest">What awaits you</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mt-3 text-[#FFF4E8]">
            A community alive with faith
          </h2>
          <p className="text-[#BFAEA3] mt-4 max-w-xl mx-auto leading-relaxed">
            Real conversations. Real prayers. Real people walking with God.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Demo Testimony */}
          <ScrollReveal delay="0s">
            <div className="glass-card ember-glow ember-border-left p-6 h-full flex flex-col">
              <span className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest bg-[#FF7A29]/10 px-3 py-1 rounded-full w-fit mb-4">
                🔥 Testimony
              </span>
              <p className="font-heading text-[#FFF4E8] text-base leading-relaxed italic flex-1">
                &ldquo;I was in my darkest season when God showed up in the most unexpected way. This community helped me remember I wasn&apos;t alone.&rdquo;
              </p>
              <div className="mt-5 pt-4 border-t border-[#FF7A29]/10 flex items-center justify-between">
                <p className="text-xs text-[#BFAEA3]">By Grace</p>
                <p className="text-xs text-[#BFAEA3]">2 hours ago</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Demo Prayer */}
          <ScrollReveal delay="0.12s">
            <div className="glass-card-gold gold-glow gold-border-left p-6 h-full flex flex-col">
              <span className="text-xs text-[#F6B25E] font-semibold uppercase tracking-widest bg-[#F6B25E]/10 px-3 py-1 rounded-full w-fit mb-4">
                🙏 Prayer Request
              </span>
              <p className="font-heading text-[#FFF4E8] text-base leading-relaxed italic flex-1">
                &ldquo;Please pray for my family going through a difficult time. I believe God is still in control.&rdquo;
              </p>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs text-[#BFAEA3]">12 people praying</p>
                <span className="text-xs text-[#F6B25E] font-semibold">🙏 Join in</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Demo Discussion */}
          <ScrollReveal delay="0.24s">
            <div className="glass-card ember-glow p-6 h-full flex flex-col">
              <span className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest bg-[#FF7A29]/10 px-3 py-1 rounded-full w-fit mb-4">
                💬 Discussion
              </span>
              <h3 className="font-heading text-[#FFF4E8] text-lg font-bold mb-3 leading-snug flex-1">
                What does trusting God daily look like for you?
              </h3>
              <p className="text-[#BFAEA3] text-sm mb-4">34 replies · Trending now</p>
              <Link href="/register" className="text-sm text-[#FF7A29] font-semibold hover:text-[#F6B25E] transition-colors">
                Join the conversation →
              </Link>
            </div>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Daily verse preview */}
          <ScrollReveal delay="0s">
            <div className="glass-card ember-glow p-8 text-center flex flex-col items-center justify-center h-full">
              <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-5">📖 Daily Scripture</p>
              <p className="font-heading text-[#FFF4E8] text-xl italic leading-relaxed scripture-glow">
                &ldquo;{verse?.text ?? 'I can do all things through Christ who strengthens me.'}&rdquo;
              </p>
              <p className="text-[#F6B25E] font-semibold text-sm mt-5">{verse?.reference ?? 'Philippians 4:13'}</p>
            </div>
          </ScrollReveal>

          {/* Featured member preview */}
          <ScrollReveal delay="0.12s">
            <div className="glass-card-gold gold-glow p-8 h-full flex flex-col">
              <span className="text-xs text-[#F6B25E] font-semibold uppercase tracking-widest bg-[#F6B25E]/10 px-3 py-1 rounded-full w-fit mb-6">
                🌟 Community Voice
              </span>
              <p className="font-heading text-[#FFF4E8] text-xl italic leading-relaxed flex-1">
                &ldquo;Learning to trust God one day at a time. This fellowship has become my anchor.&rdquo;
              </p>
              <p className="text-[#BFAEA3] text-sm mt-5">— Samantha</p>
              <Link href="/register" className="mt-4 inline-flex items-center gap-1 text-sm text-[#F6B25E] font-semibold hover:text-[#FFF4E8] transition-colors">
                Meet the community →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── WHY JOIN ─────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <ScrollReveal className="mb-16">
          <span className="text-xs text-[#F6B25E] font-semibold uppercase tracking-widest">Why Faithful Flames</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mt-3 text-[#FFF4E8] text-center">
            Built for your faith journey
          </h2>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {([
            {
              title: 'Never pray alone',
              desc: "Share your needs and carry each other's burdens. Every prayer here is lifted together.",
              gold: true,
              icon: (
                <svg className="w-9 h-9 mx-auto mb-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
            },
            {
              title: 'Daily devotions',
              desc: 'Scripture, reflections, and devotions curated to help you grow deeper every day.',
              gold: false,
              icon: (
                <svg className="w-9 h-9 mx-auto mb-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="9" y1="12" x2="13" y2="12" />
                </svg>
              ),
            },
            {
              title: 'Young believers',
              desc: 'A community of young Christians who understand your season and walk alongside you.',
              gold: false,
              icon: (
                <svg className="w-9 h-9 mx-auto mb-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              ),
            },
            {
              title: 'Safe discussions',
              desc: 'A moderated, judgment-free space to ask questions, share doubts, and find truth together.',
              gold: true,
              icon: (
                <svg className="w-9 h-9 mx-auto mb-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              ),
            },
          ] as { title: string; desc: string; gold: boolean; icon: ReactNode }[]).map(({ title, desc, gold, icon }) => (
            <ScrollReveal key={title}>
              <div className={`${gold ? 'glass-card-gold gold-glow' : 'glass-card ember-glow'} p-6 text-center h-full flex flex-col`}>
                <div className={gold ? 'text-[#F6B25E]' : 'text-[#FF7A29]'}>{icon}</div>
                <h3 className="font-heading text-[#FFF4E8] text-lg font-bold mb-3">{title}</h3>
                <p className="text-[#BFAEA3] text-sm leading-relaxed flex-1">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── FEATURED SCRIPTURE ───────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <Image src="/faithful.png" alt="" fill className="object-cover object-center opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A0A] via-[#0D0A0A]/60 to-[#0D0A0A]" />
        <div className="absolute inset-0 pointer-events-none ember-ray-glow" />

        <ScrollReveal className="relative z-10 text-center max-w-3xl mx-auto">
          <p className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest mb-8">✦ Scripture ✦</p>
          <blockquote className="font-heading text-3xl md:text-5xl font-bold text-[#FFF4E8] leading-tight scripture-glow italic mb-8">
            &ldquo;{verse?.text ?? 'For where two or three gather in my name, there am I with them.'}&rdquo;
          </blockquote>
          <p className="text-[#F6B25E] text-xl font-semibold tracking-wide">
            {verse?.reference ?? 'Matthew 18:20'}
          </p>
          <Link href="/verses" className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 border border-[#FF7A29]/25 text-[#FF7A29] font-semibold rounded-2xl hover:bg-[#FF7A29]/10 transition-all duration-300 text-sm">
            Explore all verses
          </Link>
        </ScrollReveal>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none ember-cta-glow" />
        <ScrollReveal className="relative z-10 text-center max-w-2xl mx-auto">
          <span className="text-xs text-[#FF7A29] font-semibold uppercase tracking-widest">You belong here</span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold mt-4 mb-6 text-[#FFF4E8] leading-tight">
            Ready to walk this<br />
            <span className="text-[#FF7A29]">journey together?</span>
          </h2>
          <p className="text-[#BFAEA3] text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Join a growing community of young believers. Your story matters here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 px-10 py-4 bg-[#FF7A29] text-white font-bold rounded-2xl hover:bg-[#F6B25E] hover:text-[#0D0A0A] transition-all duration-300 shadow-xl shadow-[#FF7A29]/20 text-base">
              🔥 Join Faithful Flames
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 px-10 py-4 border border-[#FFF4E8]/15 text-[#FFF4E8] font-semibold rounded-2xl hover:bg-[#FFF4E8]/8 transition-all duration-300 text-base">
              Sign in
            </Link>
          </div>
          <p className="text-[#BFAEA3]/50 text-sm mt-8 italic">
            &ldquo;For where two or three gather in my name, there am I with them.&rdquo; — Matthew 18:20
          </p>
        </ScrollReveal>
      </section>

    </div>
  )
}
