export const dynamic = 'force-dynamic'
import React from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EmberParticles } from '@/components/EmberParticles'
import { ScrollReveal } from '@/components/ScrollReveal'
import { TimeGreeting } from '@/components/TimeGreeting'
import { FORUM_TOPIC_MAP } from '@/lib/forum-topics'
import {
  Flame, Heart, MessageCircle, BookOpen,
  PenLine, Users, Shield, Quote, Sun,
} from 'lucide-react'

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getPublicData() {
  const [verse, memberCount, prayerCount] = await Promise.all([
    prisma.verse.findFirst({ where: { isDaily: true } }).then(
      (v) => v ?? prisma.verse.findFirst({ orderBy: { createdAt: 'desc' } })
    ),
    prisma.user.count(),
    prisma.forumPost.count({ where: { topic: 'PRAYER_REQUESTS', isFlagged: false } }),
  ])
  return { verse, memberCount, prayerCount }
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
      <div className="bg-cream text-lm-text dark:bg-[#0D0A0A] dark:text-[#FFF4E8] min-h-screen">

        {/* ── HERO ─────────────────────────────────────────── */}
        <div className="bg-lm-section dark:bg-[#161111] border-b border-lm-border dark:border-[#FF7A29]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-between gap-8">
            <TimeGreeting firstName={firstName} />
            {data.verse && (
              <div className="hidden md:flex items-start gap-3 bg-white dark:bg-[#1E1818] border border-lm-border dark:border-[#FF7A29]/15 rounded-2xl px-5 py-4 max-w-sm shadow-sm dark:shadow-none flex-shrink-0">
                <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0 text-lm-accent dark:text-[#F6B25E]" />
                <div className="min-w-0">
                  <p className="text-lm-text dark:text-[#FFF4E8] text-sm italic leading-relaxed line-clamp-2">
                    &ldquo;{data.verse.text}&rdquo;
                  </p>
                  <p className="text-lm-accent dark:text-[#F6B25E] text-xs font-semibold mt-1.5">{data.verse.reference}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── QUICK ACTIONS ────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { href: '/testimonies', Icon: Flame,         label: 'Share Testimony'  },
              { href: '/forum',       Icon: Heart,         label: 'Ask for Prayer'   },
              { href: '/forum',       Icon: MessageCircle, label: 'Start Discussion' },
              { href: '/reflections', Icon: PenLine,       label: 'Write Reflection' },
            ]).map(({ href, Icon, label }) => (
              <Link
                key={label}
                href={href}
                className="glass-card-static flex flex-col items-center gap-2.5 py-5 px-3 text-center group hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <Icon className="w-5 h-5 text-lm-accent dark:text-[#FF7A29] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-lm-muted dark:text-[#BFAEA3] group-hover:text-lm-accent dark:group-hover:text-[#FF7A29] transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── MAIN BODY ─────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-[1fr_288px] gap-8">

            {/* COMMUNITY FEED */}
            <main className="space-y-3 min-w-0">
              {feed.length > 0 ? feed.map((entry) => {
                if (entry.kind === 'post') {
                  const post  = entry.item
                  const meta  = TOPIC_META[post.topic] ?? { label: post.topic, labelSingular: post.topic, icon: '', isPrayer: false, light: '', dark: '' }
                  const TopicIcon = post.topic === 'PRAYER_REQUESTS' ? Heart
                    : post.topic === 'BIBLE_QUESTIONS'  ? BookOpen
                    : post.topic === 'ACCOUNTABILITY'   ? Shield
                    : Flame
                  return (
                    <Link key={`post-${post.id}`} href={`/forum/${post.id}`} className="block">
                      <div className={meta.isPrayer
                        ? 'glass-card-gold gold-border-left gold-glow p-5'
                        : 'glass-card ember-border-left ember-glow p-5'}>
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest ${meta.isPrayer ? 'text-[#D97706] dark:text-[#F6B25E]' : 'text-lm-accent dark:text-[#FF7A29]'}`}>
                            <TopicIcon className="w-3.5 h-3.5" />{meta.label}
                          </span>
                          <span className="text-xs text-lm-muted dark:text-[#BFAEA3] flex-shrink-0">{timeAgo(post.createdAt)}</span>
                        </div>
                        <h3 className="font-heading text-lm-text dark:text-[#FFF4E8] font-bold leading-snug mb-1.5">{post.title}</h3>
                        <p className="text-lm-muted dark:text-[#BFAEA3] text-sm line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-lm-muted dark:text-[#BFAEA3]">
                          <span>By {post.user.name ?? 'Anonymous'}</span>
                          <span className="inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}</span>
                        </div>
                      </div>
                    </Link>
                  )
                }

                const testimony = entry.item
                return (
                  <Link key={`testimony-${testimony.id}`} href="/testimonies" className="block">
                    <div className="glass-card ember-border-left ember-glow p-5">
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest">
                          <Flame className="w-3.5 h-3.5" />Testimony
                        </span>
                        <span className="text-xs text-lm-muted dark:text-[#BFAEA3] flex-shrink-0">{timeAgo(testimony.createdAt)}</span>
                      </div>
                      <p className="font-heading text-lm-text dark:text-[#FFF4E8] italic leading-relaxed line-clamp-3">
                        &ldquo;{testimony.content}&rdquo;
                      </p>
                      <p className="text-xs text-lm-muted dark:text-[#BFAEA3] mt-2.5">
                        {testimony.isAnonymous ? 'Anonymous' : (testimony.user.name ?? 'A believer')}
                      </p>
                    </div>
                  </Link>
                )
              }) : (
                <div className="glass-card ember-glow p-12 text-center">
                  <Flame className="w-10 h-10 mx-auto mb-4 text-lm-accent dark:text-[#FF7A29]" />
                  <h3 className="font-heading text-lm-text dark:text-[#FFF4E8] text-xl font-bold mb-2">
                    Be the first voice in this fellowship
                  </h3>
                  <p className="text-lm-muted dark:text-[#BFAEA3] text-sm mb-6 max-w-sm mx-auto">
                    Your story, your questions, your prayers. They matter here.
                  </p>
                  <Link
                    href="/forum"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-lm-accent dark:bg-[#FF7A29]/15 text-white dark:text-[#FF7A29] border border-lm-accent dark:border-[#FF7A29]/25 font-semibold rounded-2xl hover:bg-secondary dark:hover:bg-[#FF7A29]/25 transition-all duration-300 text-sm"
                  >
                    Start the conversation
                  </Link>
                </div>
              )}

              {feed.length > 0 && (
                <p className="text-center pt-2">
                  <Link href="/forum" className="text-sm text-lm-muted dark:text-[#BFAEA3] hover:text-lm-accent dark:hover:text-[#FF7A29] transition-colors">
                    View all community posts →
                  </Link>
                </p>
              )}
            </main>

            {/* SIDEBAR */}
            <aside className="space-y-4">

              {/* Mini profile card */}
              <div className="glass-card-static ember-glow p-5">
                <div className="flex flex-col items-center text-center">
                  {session.user.image ? (
                    <Image src={session.user.image} alt="" width={52} height={52} className="rounded-full ring-2 ring-lm-accent/30 dark:ring-ember/30 mb-3" />
                  ) : (
                    <div className="w-[52px] h-[52px] rounded-full bg-lm-accent dark:bg-ember text-white flex items-center justify-center text-xl font-bold mb-3">
                      {session.user.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <p className="font-heading font-bold text-lm-text dark:text-[#FFF4E8] text-base leading-tight">{session.user.name}</p>
                  {data.profile?.favoriteVerse && (
                    <p className="text-lm-accent dark:text-[#F6B25E] text-xs mt-1.5 italic line-clamp-2">{data.profile.favoriteVerse}</p>
                  )}
                </div>
                {data.profile && (
                  <div className="flex justify-around mt-4 pt-4 border-t border-lm-border dark:border-[#FF7A29]/10">
                    <div className="text-center">
                      <p className="text-base font-bold text-lm-text dark:text-[#FFF4E8]">{data.profile._count.forumPosts}</p>
                      <p className="text-lm-muted dark:text-[#BFAEA3] text-xs">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-lm-text dark:text-[#FFF4E8]">{data.profile._count.reflections}</p>
                      <p className="text-lm-muted dark:text-[#BFAEA3] text-xs">Reflections</p>
                    </div>
                  </div>
                )}
                <Link href="/profile" className="block mt-3 text-center text-xs text-lm-accent dark:text-[#FF7A29] hover:text-secondary dark:hover:text-[#F6B25E] transition-colors font-semibold">
                  View full profile →
                </Link>
              </div>

              {/* Community Pulse */}
              <div className="glass-card-static p-4">
                <p className="text-xs text-lm-muted dark:text-[#BFAEA3] font-semibold uppercase tracking-widest mb-3">Community Pulse</p>
                <div className="space-y-0">
                  {([
                    { label: 'Discussions',     value: data.feedPosts.length,   Icon: MessageCircle },
                    { label: 'Prayer requests', value: data.prayerPosts.length, Icon: Heart },
                    { label: 'Testimonies',     value: data.testimonies.length, Icon: Flame },
                  ] as { label: string; value: number; Icon: React.ElementType }[]).map(({ label, value, Icon }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-lm-border dark:border-[#FF7A29]/6 last:border-0">
                      <span className="text-lm-muted dark:text-[#BFAEA3] text-sm flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" />{label}</span>
                      <span className="text-lm-text dark:text-[#FFF4E8] font-bold text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation links */}
              <div className="glass-card-static p-4">
                <p className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest mb-3">Navigate</p>
                {([
                  { Icon: Users,       label: 'Community',      href: '/forum' },
                  { Icon: BookOpen,    label: 'Verses',         href: '/verses' },
                  { Icon: Sun,         label: 'Devotions',      href: '/devotions' },
                  { Icon: Flame,       label: 'Testimonies',    href: '/testimonies' },
                  { Icon: PenLine,     label: 'My Reflections', href: '/reflections' },
                ] as { Icon: React.ElementType; label: string; href: string }[]).map(({ Icon, label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 py-2 text-sm text-lm-muted dark:text-[#BFAEA3] hover:text-lm-accent dark:hover:text-[#FF7A29] transition-colors"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                  </Link>
                ))}
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
  const { verse, memberCount, prayerCount } = await getPublicData()

  return (
    <div className="bg-cream text-lm-text dark:bg-[#0D0A0A] dark:text-[#FFF4E8]">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <Image src="/faithful.png" alt="" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream dark:from-[#0D0A0A] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#FF7A29]/12 to-transparent" />
        <EmberParticles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — headline */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF7A29]/15 border border-[#FF7A29]/25 text-[#F6B25E] text-sm font-medium mb-8">
                <Flame className="w-4 h-4" /> A digital campfire for young believers
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
                <Link href="/community" className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#FFF4E8]/20 text-[#FFF4E8] font-semibold rounded-2xl hover:bg-[#FFF4E8]/10 transition-all duration-300">
                  Explore Community
                </Link>
              </div>
            </div>

            {/* Right — floating preview cards */}
            <div className="flex flex-col gap-4 animate-slide-up mt-12 lg:mt-0">
              <div className="glass-card-static ember-glow p-6 animate-float">
                <p className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />Verse of the Day</p>
                <p className="font-heading text-base text-lm-text dark:text-[#FFF4E8] italic leading-relaxed line-clamp-3">
                  &ldquo;{verse?.text ?? 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you.'}&rdquo;
                </p>
                <p className="text-xs text-lm-muted dark:text-[#BFAEA3] mt-3 font-medium">{verse?.reference ?? 'Joshua 1:9'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card-static gold-glow p-5 animate-float-delayed">
                  <p className="text-xs text-[#D97706] dark:text-[#F6B25E] font-semibold uppercase tracking-widest mb-2 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" />Prayers</p>
                  <p className="text-3xl font-bold text-lm-text dark:text-[#FFF4E8]">{prayerCount}</p>
                  <p className="text-xs text-lm-muted dark:text-[#BFAEA3] mt-1">Active requests</p>
                </div>
                <div className="glass-card-static p-5 animate-float-slow">
                  <p className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Community</p>
                  <p className="text-3xl font-bold text-lm-text dark:text-[#FFF4E8]">{memberCount}</p>
                  <p className="text-xs text-lm-muted dark:text-[#BFAEA3] mt-1">Members and growing</p>
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
          <span className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest">What awaits you</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mt-3 text-lm-text dark:text-[#FFF4E8]">
            A community alive with faith
          </h2>
          <p className="text-lm-muted dark:text-[#BFAEA3] mt-4 max-w-xl mx-auto leading-relaxed">
            Real conversations. Real prayers. Real people walking with God.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Demo Testimony */}
          <ScrollReveal delay="0s">
            <div className="glass-card ember-glow ember-border-left p-6 h-full flex flex-col">
              <span className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest bg-[#FF7A29]/10 px-3 py-1 rounded-full w-fit mb-4 inline-flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />Testimony
              </span>
              <p className="font-heading text-lm-text dark:text-[#FFF4E8] text-base leading-relaxed italic flex-1">
                &ldquo;I was in my darkest season when God showed up in the most unexpected way. This community helped me remember I wasn&apos;t alone.&rdquo;
              </p>
              <div className="mt-5 pt-4 border-t border-lm-border dark:border-[#FF7A29]/10 flex items-center justify-between">
                <p className="text-xs text-lm-muted dark:text-[#BFAEA3]">By Grace</p>
                <p className="text-xs text-lm-muted dark:text-[#BFAEA3]">2 hours ago</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Demo Prayer */}
          <ScrollReveal delay="0.12s">
            <div className="glass-card-gold gold-glow gold-border-left p-6 h-full flex flex-col">
              <span className="text-xs text-[#D97706] dark:text-[#F6B25E] font-semibold uppercase tracking-widest bg-[#F6B25E]/10 px-3 py-1 rounded-full w-fit mb-4 inline-flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />Prayer Request
              </span>
              <p className="font-heading text-lm-text dark:text-[#FFF4E8] text-base leading-relaxed italic flex-1">
                &ldquo;Please pray for my family going through a difficult time. I believe God is still in control.&rdquo;
              </p>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs text-lm-muted dark:text-[#BFAEA3]">{prayerCount} prayer {prayerCount === 1 ? 'request' : 'requests'} active</p>
                <span className="text-xs text-[#D97706] dark:text-[#F6B25E] font-semibold inline-flex items-center gap-1"><Heart className="w-3 h-3" />Join in</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Demo Discussion */}
          <ScrollReveal delay="0.24s">
            <div className="glass-card ember-glow p-6 h-full flex flex-col">
              <span className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest bg-[#FF7A29]/10 px-3 py-1 rounded-full w-fit mb-4 inline-flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />Discussion
              </span>
              <h3 className="font-heading text-lm-text dark:text-[#FFF4E8] text-lg font-bold mb-3 leading-snug flex-1">
                What does trusting God daily look like for you?
              </h3>
              <p className="text-lm-muted dark:text-[#BFAEA3] text-sm mb-4">Active discussion · Trending now</p>
              <Link href="/register" className="text-sm text-lm-accent dark:text-[#FF7A29] font-semibold hover:text-secondary dark:hover:text-[#F6B25E] transition-colors">
                Join the conversation →
              </Link>
            </div>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Daily verse preview */}
          <ScrollReveal delay="0s">
            <div className="glass-card ember-glow p-8 text-center flex flex-col items-center justify-center h-full">
              <p className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest mb-5 flex items-center justify-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />Daily Scripture</p>
              <p className="font-heading text-lm-text dark:text-[#FFF4E8] text-xl italic leading-relaxed scripture-glow">
                &ldquo;{verse?.text ?? 'I can do all things through Christ who strengthens me.'}&rdquo;
              </p>
              <p className="text-[#D97706] dark:text-[#F6B25E] font-semibold text-sm mt-5">{verse?.reference ?? 'Philippians 4:13'}</p>
            </div>
          </ScrollReveal>

          {/* Featured member preview */}
          <ScrollReveal delay="0.12s">
            <div className="glass-card-gold gold-glow p-8 h-full flex flex-col">
              <span className="text-xs text-[#D97706] dark:text-[#F6B25E] font-semibold uppercase tracking-widest bg-[#F6B25E]/10 px-3 py-1 rounded-full w-fit mb-6 inline-flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5" />Community Voice
              </span>
              <p className="font-heading text-lm-text dark:text-[#FFF4E8] text-xl italic leading-relaxed flex-1">
                &ldquo;Learning to trust God one day at a time. This fellowship has become my anchor.&rdquo;
              </p>
              <p className="text-lm-muted dark:text-[#BFAEA3] text-sm mt-5">Samantha</p>
              <Link href="/register" className="mt-4 inline-flex items-center gap-1 text-sm text-[#D97706] dark:text-[#F6B25E] font-semibold hover:text-lm-text dark:hover:text-[#FFF4E8] transition-colors">
                Meet the community →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── WHY JOIN ─────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <ScrollReveal className="mb-16">
          <span className="text-xs text-[#D97706] dark:text-[#F6B25E] font-semibold uppercase tracking-widest">Why Faithful Flames</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mt-3 text-lm-text dark:text-[#FFF4E8] text-center">
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
                <div className={gold ? 'text-[#D97706] dark:text-[#F6B25E]' : 'text-lm-accent dark:text-[#FF7A29]'}>{icon}</div>
                <h3 className="font-heading text-lm-text dark:text-[#FFF4E8] text-lg font-bold mb-3">{title}</h3>
                <p className="text-lm-muted dark:text-[#BFAEA3] text-sm leading-relaxed flex-1">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── FEATURED SCRIPTURE ───────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <Image src="/faithful.png" alt="" fill className="object-cover object-center opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/80 to-cream dark:from-[#0D0A0A] dark:via-[#0D0A0A]/60 dark:to-[#0D0A0A]" />
        <div className="absolute inset-0 pointer-events-none ember-ray-glow" />

        <ScrollReveal className="relative z-10 text-center max-w-3xl mx-auto">
          <p className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest mb-8">✦ Scripture ✦</p>
          <blockquote className="font-heading text-3xl md:text-5xl font-bold text-lm-text dark:text-[#FFF4E8] leading-tight scripture-glow italic mb-8">
            &ldquo;{verse?.text ?? 'For where two or three gather in my name, there am I with them.'}&rdquo;
          </blockquote>
          <p className="text-[#D97706] dark:text-[#F6B25E] text-xl font-semibold tracking-wide">
            {verse?.reference ?? 'Matthew 18:20'}
          </p>
          <Link href="/verses" className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 border border-lm-border dark:border-[#FF7A29]/25 text-lm-accent dark:text-[#FF7A29] font-semibold rounded-2xl hover:bg-lm-accent/10 dark:hover:bg-[#FF7A29]/10 transition-all duration-300 text-sm">
            Explore all verses
          </Link>
        </ScrollReveal>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none ember-cta-glow" />
        <ScrollReveal className="relative z-10 text-center max-w-2xl mx-auto">
          <span className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest">You belong here</span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold mt-4 mb-6 text-lm-text dark:text-[#FFF4E8] leading-tight">
            Ready to walk this<br />
            <span className="text-lm-accent dark:text-[#FF7A29]">journey together?</span>
          </h2>
          <p className="text-lm-muted dark:text-[#BFAEA3] text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Join a growing community of young believers. Your story matters here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 px-10 py-4 bg-lm-accent dark:bg-[#FF7A29] text-white font-bold rounded-2xl hover:bg-secondary dark:hover:bg-[#F6B25E] dark:hover:text-[#0D0A0A] transition-all duration-300 shadow-xl shadow-lm-accent/20 dark:shadow-[#FF7A29]/20 text-base">
              <Flame className="w-4 h-4" />Join Faithful Flames
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 px-10 py-4 border border-lm-border dark:border-[#FFF4E8]/15 text-lm-text dark:text-[#FFF4E8] font-semibold rounded-2xl hover:bg-[#F59E0B]/8 dark:hover:bg-[#FFF4E8]/8 transition-all duration-300 text-base">
              Sign in
            </Link>
          </div>
          <p className="text-lm-muted/50 dark:text-[#BFAEA3]/50 text-sm mt-8 italic">
            &ldquo;For where two or three gather in my name, there am I with them.&rdquo; (Matthew 18:20)
          </p>
        </ScrollReveal>
      </section>

    </div>
  )
}
