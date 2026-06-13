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
  PenLine, Users, Shield, Quote, Sun, ChevronRight,
} from 'lucide-react'
import { UserAvatar } from '@/components/UserAvatar'
import { HeroIllustration } from '@/components/HeroIllustration'

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getPublicData() {
  const [verse, memberCount, prayerCount, previewTestimony, previewPrayer, previewDiscussion, previewVoice] = await Promise.all([
    prisma.verse.findFirst({ where: { isDaily: true } }).then(
      (v) => v ?? prisma.verse.findFirst({ orderBy: { createdAt: 'desc' } })
    ),
    prisma.user.count(),
    prisma.forumPost.count({ where: { topic: 'PRAYER_REQUESTS', isFlagged: false } }),
    prisma.testimony.findFirst({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
    prisma.forumPost.findFirst({
      where: { topic: 'PRAYER_REQUESTS', isFlagged: false },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.forumPost.findFirst({
      where: { topic: { notIn: ['PRAYER_REQUESTS', 'TESTIMONIES'] }, isFlagged: false },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.testimony.findFirst({
      where: { isApproved: true },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { name: true } } },
    }),
  ])
  return { verse, memberCount, prayerCount, previewTestimony, previewPrayer, previewDiscussion, previewVoice }
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
        createdAt: true,
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

const ENCOURAGEMENT_QUOTES = [
  { text: 'Let all that you do be done in love.',                    reference: '1 Corinthians 16:14' },
  { text: 'I can do all things through Christ who strengthens me.',  reference: 'Philippians 4:13'    },
  { text: 'Trust in the Lord with all your heart.',                  reference: 'Proverbs 3:5'        },
  { text: 'Be strong and courageous. Do not be afraid.',             reference: 'Joshua 1:9'          },
  { text: 'The Lord is my shepherd; I shall not want.',              reference: 'Psalm 23:1'          },
  { text: 'For I know the plans I have for you, declares the Lord.', reference: 'Jeremiah 29:11'      },
  { text: 'Love one another as I have loved you.',                   reference: 'John 15:12'          },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // ════════════════════════════════════════════════════════════════════════════
  // SIGNED IN — Community Dashboard
  // ════════════════════════════════════════════════════════════════════════════
  if (session?.user) {
    const data = await getDashboardData(session.user.id)
    const firstName = (data.profile?.name ?? session.user.name)?.split(' ')[0] ?? 'Friend'
    const memberSince = data.profile?.createdAt
      ? new Date(data.profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : null
    const heroQuote = ENCOURAGEMENT_QUOTES[new Date().getDay()]

    return (
      <div className="bg-cream text-lm-text dark:bg-[#0D0A0A] dark:text-[#FFF4E8] min-h-screen">

        {/* ── HERO ─────────────────────────────────────────── */}
        <div className="bg-[#FFF3E6] dark:bg-[#161111] border-b border-lm-border dark:border-[#FF7A29]/10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center gap-6">
            <div className="flex-1 min-w-0">
              <TimeGreeting firstName={firstName} />
            </div>
            <div className="hidden md:flex items-start gap-3 bg-white/80 dark:bg-[#1E1818]/80 border border-lm-border dark:border-[#FF7A29]/15 rounded-2xl px-5 py-4 max-w-[280px] shadow-sm flex-shrink-0">
              <span className="text-3xl text-lm-accent dark:text-[#F6B25E] font-bold leading-none flex-shrink-0 mt-[-2px]">&ldquo;</span>
              <div className="min-w-0">
                <p className="text-lm-text dark:text-[#FFF4E8] text-sm italic leading-relaxed line-clamp-3">{heroQuote.text}</p>
                <p className="text-lm-muted dark:text-[#BFAEA3] text-xs mt-2">{heroQuote.reference}</p>
              </div>
            </div>
            <HeroIllustration />
          </div>
        </div>

        {/* ── QUICK ACTIONS ────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { href: '/testimonies', Icon: Flame,         label: 'Share Testimony',  desc: 'Encourage others by sharing your story',    animate: true  },
              { href: '/forum',       Icon: Heart,         label: 'Ask for Prayer',   desc: 'Submit a prayer request to the community',  animate: false },
              { href: '/forum',       Icon: MessageCircle, label: 'Start Discussion', desc: 'Start a conversation and connect',           animate: false },
              { href: '/reflections', Icon: PenLine,       label: 'Write Reflection', desc: 'Write your thoughts and grow spiritually',   animate: false },
            ]).map(({ href, Icon, label, desc, animate }) => (
              <Link
                key={label}
                href={href}
                className="bg-white dark:bg-[#1E1818] border border-lm-border dark:border-[#FF7A29]/12 rounded-2xl p-4 flex items-center gap-3 group hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-lm-accent/10 dark:bg-[#FF7A29]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 text-lm-accent dark:text-[#FF7A29] group-hover:scale-110 transition-transform${animate ? ' flame-icon-animated' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-lm-text dark:text-[#FFF4E8] leading-tight">{label}</p>
                  <p className="text-xs text-lm-muted dark:text-[#BFAEA3] mt-0.5 hidden sm:block leading-snug">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-lm-muted dark:text-[#BFAEA3] flex-shrink-0 group-hover:text-lm-accent dark:group-hover:text-[#FF7A29] transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── MAIN BODY ─────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
          <div className="grid lg:grid-cols-[1fr_288px] gap-8">

            <main className="space-y-6 min-w-0">

              {/* TODAY'S VERSE */}
              <div className="glass-card-static ember-glow p-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-44 pointer-events-none select-none hidden sm:block">
                  <svg viewBox="0 0 180 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden="true">
                    <path d="M30 200 Q60 155 90 170 Q120 185 150 155 L180 165 L180 200 Z" fill="#8DAF6A" opacity="0.2" />
                    <rect x="82" y="65" width="16" height="88" rx="3" fill="#C4874A" opacity="0.4" />
                    <rect x="60" y="88" width="60" height="15" rx="3" fill="#C4874A" opacity="0.4" />
                    <line x1="55" y1="200" x2="55" y2="150" stroke="#5E9834" strokeWidth="2.5" strokeLinecap="round" />
                    <ellipse cx="55" cy="146" rx="9" ry="12" fill="#6DB240" opacity="0.5" />
                    <line x1="42" y1="180" x2="30" y2="162" stroke="#5E9834" strokeWidth="1.5" strokeLinecap="round" />
                    <ellipse cx="27" cy="158" rx="7" ry="9" fill="#5E9834" opacity="0.4" />
                    <line x1="130" y1="200" x2="130" y2="148" stroke="#5E9834" strokeWidth="2.5" strokeLinecap="round" />
                    <ellipse cx="130" cy="144" rx="9" ry="12" fill="#6DB240" opacity="0.5" />
                    <line x1="143" y1="178" x2="155" y2="160" stroke="#5E9834" strokeWidth="1.5" strokeLinecap="round" />
                    <ellipse cx="158" cy="156" rx="7" ry="9" fill="#5E9834" opacity="0.4" />
                    <circle cx="40" cy="192" r="4.5" fill="#FFB347" opacity="0.55" />
                    <circle cx="52" cy="196" r="3" fill="#FF8C42" opacity="0.45" />
                    <circle cx="143" cy="193" r="4.5" fill="#FFD166" opacity="0.55" />
                    <circle cx="155" cy="188" r="3" fill="#FFB347" opacity="0.45" />
                    <circle cx="90" cy="200" r="3" fill="#FFB347" opacity="0.35" />
                  </svg>
                </div>
                <div className="relative pr-0 sm:pr-44">
                  <p className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />Today&apos;s Verse
                  </p>
                  <p className="font-heading text-lm-text dark:text-[#FFF4E8] text-xl md:text-2xl italic leading-relaxed mb-2">
                    &ldquo;{data.verse?.text ?? 'Where two or three gather in my name, there am I with them.'}&rdquo;
                  </p>
                  {data.verse && (
                    <p className="text-lm-accent dark:text-[#F6B25E] text-sm font-semibold mb-4">{data.verse.reference}</p>
                  )}
                  <div className="border-t border-lm-border dark:border-[#FF7A29]/10 pt-4 flex items-center gap-4">
                    {data.feedPosts.length === 0 && (
                      <p className="text-lm-muted dark:text-[#BFAEA3] text-xs leading-relaxed flex-1">
                        The community feed is quiet right now — use the actions above to spark a conversation.
                      </p>
                    )}
                    <Link
                      href="/verses"
                      className={`inline-flex items-center gap-1 text-sm font-semibold text-lm-accent dark:text-[#FF7A29] hover:text-secondary dark:hover:text-[#F6B25E] transition-colors flex-shrink-0 ${data.feedPosts.length > 0 ? 'ml-auto' : ''}`}
                    >
                      View all verses <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* COMMUNITY FEED */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-lg font-bold text-lm-text dark:text-[#FFF4E8] flex items-center gap-2">
                    <Users className="w-5 h-5 text-lm-accent dark:text-[#FF7A29]" />
                    Community Feed
                  </h2>
                  <span className="text-xs text-lm-muted dark:text-[#BFAEA3] bg-lm-section dark:bg-[#1E1818] border border-lm-border dark:border-[#FF7A29]/12 rounded-lg px-3 py-1.5 flex items-center gap-1 select-none">
                    Latest <ChevronRight className="w-3 h-3 rotate-90 opacity-60" />
                  </span>
                </div>

                {data.feedPosts.length > 0 ? (
                  <div className="space-y-3">
                    {data.feedPosts.slice(0, 5).map((post) => {
                      const meta = TOPIC_META[post.topic] ?? { label: post.topic, labelSingular: post.topic, isPrayer: false }
                      const TopicIcon = post.topic === 'PRAYER_REQUESTS' ? Heart
                        : post.topic === 'BIBLE_QUESTIONS'  ? BookOpen
                        : post.topic === 'ACCOUNTABILITY'   ? Shield
                        : Flame
                      return (
                        <Link key={post.id} href={`/forum/${post.id}`} className="block group">
                          <article className={`rounded-2xl p-5 bg-white dark:bg-[#1E1818] border border-lm-border dark:border-[#FF7A29]/10 border-l-4 ${
                            meta.isPrayer
                              ? 'border-l-amber-400 dark:border-l-[#F6B25E]'
                              : 'border-l-lm-accent dark:border-l-ember'
                          } hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                            <div className="flex items-start gap-3">
                              <UserAvatar src={post.user.image} name={post.user.name} size={40} />
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                    meta.isPrayer
                                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#F6B25E]/10 dark:text-[#F6B25E] dark:border-[#F6B25E]/25'
                                      : 'bg-lm-accent/10 text-lm-accent border-lm-accent/20 dark:bg-[#FF7A29]/10 dark:text-[#FF7A29] dark:border-[#FF7A29]/25'
                                  }`}>
                                    <TopicIcon className="w-2.5 h-2.5" />{meta.label}
                                  </span>
                                  <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">
                                    {post.user.name} · {timeAgo(post.createdAt)}
                                  </span>
                                </div>
                                <h3 className="font-heading text-base font-bold text-lm-text dark:text-[#FFF4E8] group-hover:text-lm-accent dark:group-hover:text-ember transition-colors mb-1 leading-snug">
                                  {post.title}
                                </h3>
                                <p className="text-lm-muted dark:text-[#BFAEA3] text-sm line-clamp-2">{post.content}</p>
                                <div className="flex items-center gap-1 mt-2.5 text-xs text-lm-muted dark:text-[#BFAEA3]">
                                  <MessageCircle className="w-3 h-3" />
                                  {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
                                </div>
                              </div>
                            </div>
                          </article>
                        </Link>
                      )
                    })}
                    {data.feedPosts.length > 5 && (
                      <p className="text-center pt-1">
                        <Link href="/forum" className="text-sm text-lm-muted dark:text-[#BFAEA3] hover:text-lm-accent dark:hover:text-[#FF7A29] transition-colors">
                          View all community posts →
                        </Link>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#1E1818] border border-lm-border dark:border-[#FF7A29]/10 rounded-2xl p-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-lm-accent/10 dark:bg-[#FF7A29]/10 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-lm-accent dark:text-[#FF7A29]" />
                    </div>
                    <p className="font-heading font-bold text-lm-text dark:text-[#FFF4E8] mb-1">No recent activity</p>
                    <p className="text-lm-muted dark:text-[#BFAEA3] text-sm mb-5">Be the first to share, ask, or start a discussion.</p>
                    <Link href="/forum" className="inline-flex items-center gap-2 px-5 py-2 border border-lm-accent dark:border-[#FF7A29] text-lm-accent dark:text-[#FF7A29] rounded-xl text-sm font-semibold hover:bg-lm-accent hover:text-white dark:hover:bg-[#FF7A29] dark:hover:text-white transition-colors">
                      Get started
                    </Link>
                  </div>
                )}
              </div>

            </main>

            {/* SIDEBAR */}
            <aside className="space-y-4">

              {/* Profile card */}
              <div className="bg-white dark:bg-[#1E1818] border border-lm-border dark:border-[#FF7A29]/12 rounded-2xl p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3">
                    <UserAvatar
                      src={data.profile?.image ?? session.user.image ?? null}
                      name={data.profile?.name ?? session.user.name ?? null}
                      size={64}
                      ringClass="ring-2 ring-lm-accent/25 dark:ring-ember/25"
                    />
                  </div>
                  <p className="font-heading font-bold text-lm-text dark:text-[#FFF4E8] text-base leading-tight">{data.profile?.name ?? session.user.name}</p>
                  {memberSince && (
                    <p className="text-lm-muted dark:text-[#BFAEA3] text-xs mt-1">Member since {memberSince}</p>
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
                <Link
                  href="/profile"
                  className="mt-4 block w-full bg-lm-accent dark:bg-[#FF7A29] text-white text-center font-semibold text-sm py-2.5 rounded-xl hover:bg-secondary dark:hover:bg-[#F6B25E] dark:hover:text-[#0D0A0A] transition-colors"
                >
                  View full profile →
                </Link>
              </div>

              {/* Navigate card */}
              <div className="bg-white dark:bg-[#1E1818] border border-lm-border dark:border-[#FF7A29]/12 rounded-2xl p-4">
                <p className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest mb-3">Navigate</p>
                {([
                  { Icon: Users,    label: 'Community',      href: '/forum',       animate: false },
                  { Icon: BookOpen, label: 'Verses',         href: '/verses',      animate: false },
                  { Icon: Sun,      label: 'Devotions',      href: '/devotions',   animate: false },
                  { Icon: Flame,    label: 'Testimonies',    href: '/testimonies', animate: true  },
                  { Icon: PenLine,  label: 'My Reflections', href: '/reflections', animate: false },
                ] as { Icon: React.ElementType; label: string; href: string; animate: boolean }[]).map(({ Icon, label, href, animate }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 py-2.5 text-sm text-lm-muted dark:text-[#BFAEA3] hover:text-lm-accent dark:hover:text-[#FF7A29] transition-colors"
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0${animate ? ' flame-icon-animated' : ''}`} />
                    <span className="flex-1">{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
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
  const { verse, memberCount, prayerCount, previewTestimony, previewPrayer, previewDiscussion, previewVoice } = await getPublicData()

  return (
    <div className="bg-cream text-lm-text dark:bg-[#0D0A0A] dark:text-[#FFF4E8]">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <Image src="/faithful.png" alt="Young believers gathered around a campfire, representing the Faithful Flames community" fill className="object-cover object-center" priority />
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
                <Link href="/forum" className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#FFF4E8]/20 text-[#FFF4E8] font-semibold rounded-2xl hover:bg-[#FFF4E8]/10 transition-all duration-300">
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
                  {prayerCount > 0 ? (
                    <>
                      <p className="text-3xl font-bold text-lm-text dark:text-[#FFF4E8]">{prayerCount}</p>
                      <p className="text-xs text-lm-muted dark:text-[#BFAEA3] mt-1">Active requests</p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-lm-text dark:text-[#FFF4E8] leading-snug mt-1">A place to be heard</p>
                  )}
                </div>
                <div className="glass-card-static p-5 animate-float-slow">
                  <p className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Community</p>
                  <p className="text-3xl font-bold text-lm-text dark:text-[#FFF4E8]">{memberCount}</p>
                  <p className="text-xs text-lm-muted dark:text-[#BFAEA3] mt-1">Growing every day</p>
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
          {/* Testimony */}
          <ScrollReveal delay="0s">
            <div className="glass-card ember-glow ember-border-left p-6 h-full flex flex-col">
              <span className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest bg-[#FF7A29]/10 px-3 py-1 rounded-full w-fit mb-4 inline-flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />Testimony
              </span>
              {previewTestimony ? (
                <>
                  <p className="font-heading text-lm-text dark:text-[#FFF4E8] text-base leading-relaxed italic flex-1 line-clamp-4">
                    &ldquo;{previewTestimony.content}&rdquo;
                  </p>
                  <div className="mt-5 pt-4 border-t border-lm-border dark:border-[#FF7A29]/10 flex items-center justify-between">
                    <p className="text-xs text-lm-muted dark:text-[#BFAEA3]">
                      {previewTestimony.isAnonymous ? 'Anonymous' : (previewTestimony.user.name ?? 'A believer')}
                    </p>
                    <Link href="/register" className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold hover:underline">Read more →</Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-heading text-lm-text dark:text-[#FFF4E8] text-base leading-relaxed italic flex-1">
                    &ldquo;Be the first to share what God has done. Your testimony could spark someone else&apos;s faith.&rdquo;
                  </p>
                  <div className="mt-5 pt-4 border-t border-lm-border dark:border-[#FF7A29]/10">
                    <Link href="/register" className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold hover:underline">Share yours →</Link>
                  </div>
                </>
              )}
            </div>
          </ScrollReveal>

          {/* Prayer Request */}
          <ScrollReveal delay="0.12s">
            <div className="glass-card-gold gold-glow gold-border-left p-6 h-full flex flex-col">
              <span className="text-xs text-[#D97706] dark:text-[#F6B25E] font-semibold uppercase tracking-widest bg-[#F6B25E]/10 px-3 py-1 rounded-full w-fit mb-4 inline-flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />Prayer Request
              </span>
              {previewPrayer ? (
                <>
                  <p className="font-heading text-lm-text dark:text-[#FFF4E8] text-base leading-relaxed italic flex-1 line-clamp-4">
                    &ldquo;{previewPrayer.content}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-xs text-lm-muted dark:text-[#BFAEA3]">{prayerCount > 0 ? `${prayerCount} prayer ${prayerCount === 1 ? 'request' : 'requests'} active` : 'Bring your burdens here'}</p>
                    <Link href="/register" className="text-xs text-[#D97706] dark:text-[#F6B25E] font-semibold inline-flex items-center gap-1 hover:underline"><Heart className="w-3 h-3" />Join in</Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-heading text-lm-text dark:text-[#FFF4E8] text-base leading-relaxed italic flex-1">
                    &ldquo;Lift each other up. Bring your burdens here and let the community carry them with you.&rdquo;
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-xs text-lm-muted dark:text-[#BFAEA3]">{prayerCount > 0 ? `${prayerCount} prayer ${prayerCount === 1 ? 'request' : 'requests'} active` : 'Bring your burdens here'}</p>
                    <Link href="/register" className="text-xs text-[#D97706] dark:text-[#F6B25E] font-semibold inline-flex items-center gap-1 hover:underline"><Heart className="w-3 h-3" />Join in</Link>
                  </div>
                </>
              )}
            </div>
          </ScrollReveal>

          {/* Discussion */}
          <ScrollReveal delay="0.24s">
            <div className="glass-card ember-glow p-6 h-full flex flex-col">
              <span className="text-xs text-lm-accent dark:text-[#FF7A29] font-semibold uppercase tracking-widest bg-[#FF7A29]/10 px-3 py-1 rounded-full w-fit mb-4 inline-flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />Discussion
              </span>
              {previewDiscussion ? (
                <>
                  <h3 className="font-heading text-lm-text dark:text-[#FFF4E8] text-lg font-bold mb-3 leading-snug flex-1 line-clamp-3">
                    {previewDiscussion.title}
                  </h3>
                  <p className="text-lm-muted dark:text-[#BFAEA3] text-sm mb-4 line-clamp-2">{previewDiscussion.content}</p>
                  <Link href="/register" className="text-sm text-lm-accent dark:text-[#FF7A29] font-semibold hover:text-secondary dark:hover:text-[#F6B25E] transition-colors">
                    Join the conversation →
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="font-heading text-lm-text dark:text-[#FFF4E8] text-lg font-bold mb-3 leading-snug flex-1">
                    What does walking with God look like for you today?
                  </h3>
                  <p className="text-lm-muted dark:text-[#BFAEA3] text-sm mb-4">Start the first discussion in this community.</p>
                  <Link href="/register" className="text-sm text-lm-accent dark:text-[#FF7A29] font-semibold hover:text-secondary dark:hover:text-[#F6B25E] transition-colors">
                    Join the conversation →
                  </Link>
                </>
              )}
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

          {/* Community Voice */}
          <ScrollReveal delay="0.12s">
            <div className="glass-card-gold gold-glow p-8 h-full flex flex-col">
              <span className="text-xs text-[#D97706] dark:text-[#F6B25E] font-semibold uppercase tracking-widest bg-[#F6B25E]/10 px-3 py-1 rounded-full w-fit mb-6 inline-flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5" />Community Voice
              </span>
              {previewVoice ? (
                <>
                  <p className="font-heading text-lm-text dark:text-[#FFF4E8] text-xl italic leading-relaxed flex-1 line-clamp-4">
                    &ldquo;{previewVoice.content}&rdquo;
                  </p>
                  <p className="text-lm-muted dark:text-[#BFAEA3] text-sm mt-5">
                    {previewVoice.isAnonymous ? 'Anonymous' : (previewVoice.user.name ?? 'A believer')}
                  </p>
                </>
              ) : (
                <p className="font-heading text-lm-text dark:text-[#FFF4E8] text-xl italic leading-relaxed flex-1">
                  &ldquo;Your voice belongs here. Share your story and strengthen someone else&apos;s faith.&rdquo;
                </p>
              )}
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
