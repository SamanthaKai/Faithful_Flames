export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Flame, Heart, MessageCircle, BookOpen, Shield, Users } from 'lucide-react'
import { ScrollReveal } from '@/components/ScrollReveal'
import { FORUM_TOPIC_MAP } from '@/lib/forum-topics'

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const GUIDELINES = [
  { icon: Heart,         text: 'Speak with love. Disagreement is okay; disrespect is not.' },
  { icon: BookOpen,      text: 'Keep it faith-centered. This space is about Jesus.' },
  { icon: Shield,        text: 'No spam or self-promotion. Share with intention.' },
  { icon: Users,         text: "Protect one another's stories. What's shared here, stays here." },
  { icon: Flame,         text: 'Testimonies are sacred. Receive them with grace.' },
  { icon: MessageCircle, text: 'If something feels wrong, report it.' },
]

export default async function CommunityPage() {
  const [recentPosts, prayerPosts, testimonies, memberCount] = await Promise.all([
    prisma.forumPost.findMany({
      where: { isFlagged: false, topic: { notIn: ['PRAYER_REQUESTS', 'TESTIMONIES'] } },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { user: { select: { name: true } }, _count: { select: { replies: true } } },
    }),
    prisma.forumPost.findMany({
      where: { isFlagged: false, topic: 'PRAYER_REQUESTS' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { _count: { select: { replies: true } } },
    }),
    prisma.testimony.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      take: 2,
      include: { user: { select: { name: true } } },
    }),
    prisma.user.count(),
  ])

  return (
    <div className="bg-cream dark:bg-[#0D0A0A] text-lm-text dark:text-[#FFF4E8] min-h-screen">

      {/* ── HERO ─────────────────────────────────────── */}
      <div className="page-hero text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-lm-accent dark:text-ember mb-4">
            <Flame className="w-3.5 h-3.5" /> Our Community
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-lm-text dark:text-[#FFF4E8] mb-4">
            A place where faith grows together
          </h1>
          <p className="text-lm-muted dark:text-[#BFAEA3] text-lg leading-relaxed max-w-xl mx-auto">
            Faithful Flames is a digital campfire for young believers. A moderated, judgment-free
            space to pray, share, ask questions, and walk with God alongside others who understand your season.
          </p>
          <div className="flex justify-center items-center gap-6 mt-8 text-sm text-lm-muted dark:text-[#BFAEA3]">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
              {memberCount} members
            </span>
            <span>Real conversations</span>
            <span>Moderated with care</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* ── WHAT HAPPENS HERE ────────────────────── */}
        <ScrollReveal>
          <h2 className="font-heading text-3xl font-bold text-lm-text dark:text-[#FFF4E8] mb-2 text-center">
            What happens inside
          </h2>
          <p className="text-lm-muted dark:text-[#BFAEA3] text-center mb-10 max-w-lg mx-auto">
            Here is a live look at what members are sharing right now. No account needed to read.
          </p>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Recent discussions */}
            <div>
              <p className="text-xs text-lm-accent dark:text-ember font-semibold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" /> Recent Discussions
              </p>
              <div className="space-y-3">
                {recentPosts.length === 0 ? (
                  <p className="text-lm-muted dark:text-[#BFAEA3] text-sm italic">No discussions yet. Be the first!</p>
                ) : recentPosts.map((post) => {
                  const meta = FORUM_TOPIC_MAP[post.topic]
                  return (
                    <div key={post.id} className="glass-card p-4 pointer-events-none select-none">
                      {meta && (
                        <span className="text-xs font-semibold text-lm-accent dark:text-ember uppercase tracking-widest mb-1.5 block">
                          {meta.label}
                        </span>
                      )}
                      <p className="font-heading font-bold text-lm-text dark:text-[#FFF4E8] text-sm leading-snug mb-1">
                        {post.title}
                      </p>
                      <p className="text-lm-muted dark:text-[#BFAEA3] text-xs line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-lm-muted dark:text-[#BFAEA3]">
                        <span>By {post.user.name ?? 'A member'}</span>
                        <span>{timeAgo(post.createdAt)}</span>
                        <span>{post._count.replies} {post._count.replies === 1 ? 'reply' : 'replies'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Prayer requests */}
            <div>
              <p className="text-xs text-[#D97706] dark:text-[#F6B25E] font-semibold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" /> Active Prayer Requests
              </p>
              <div className="space-y-3">
                {prayerPosts.length === 0 ? (
                  <p className="text-lm-muted dark:text-[#BFAEA3] text-sm italic">No prayer requests yet.</p>
                ) : prayerPosts.map((post) => (
                  <div key={post.id} className="glass-card-gold p-4 pointer-events-none select-none">
                    <p className="font-heading font-bold text-lm-text dark:text-[#FFF4E8] text-sm leading-snug mb-1">
                      {post.title}
                    </p>
                    <p className="text-lm-muted dark:text-[#BFAEA3] text-xs line-clamp-2">{post.content}</p>
                    <p className="text-xs text-[#D97706] dark:text-[#F6B25E] mt-2">{timeAgo(post.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Testimonies */}
          {testimonies.length > 0 && (
            <div className="mt-8">
              <p className="text-xs text-lm-accent dark:text-ember font-semibold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Recent Testimonies
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {testimonies.map((t) => (
                  <div key={t.id} className="glass-card ember-glow ember-border-left p-5 pointer-events-none select-none">
                    <p className="font-heading text-lm-text dark:text-[#FFF4E8] italic text-sm leading-relaxed line-clamp-4">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <p className="text-xs text-lm-muted dark:text-[#BFAEA3] mt-3">
                      {t.isAnonymous ? 'Anonymous' : (t.user.name ?? 'A believer')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollReveal>

        {/* ── COMMUNITY GUIDELINES ─────────────────── */}
        <ScrollReveal>
          <div className="glass-card-static p-8 md:p-10">
            <div className="text-center mb-8">
              <span className="text-xs text-lm-accent dark:text-ember font-semibold uppercase tracking-widest">
                How we live together
              </span>
              <h2 className="font-heading text-3xl font-bold text-lm-text dark:text-[#FFF4E8] mt-2">
                Community Guidelines
              </h2>
              <p className="text-lm-muted dark:text-[#BFAEA3] mt-3 max-w-md mx-auto text-sm">
                These are not rules to restrict you. They are commitments we make to each other so this stays
                a place where people feel safe to be honest.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {GUIDELINES.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-lm-accent/10 dark:bg-ember/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-lm-accent dark:text-ember" />
                  </div>
                  <p className="text-lm-text dark:text-[#FFF4E8] text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── WHY JOIN ─────────────────────────────── */}
        <ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Heart,  title: 'Never pray alone',     desc: 'Every prayer request here is carried by the whole community.' },
              { icon: Users,  title: 'Young believers',      desc: 'People who understand your season and walk alongside you.' },
              { icon: Shield, title: 'Safe and moderated',   desc: 'Every post is reviewed. No toxicity, no judgment.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card p-6">
                <div className="w-12 h-12 rounded-full bg-lm-accent/10 dark:bg-ember/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-lm-accent dark:text-ember" />
                </div>
                <h3 className="font-heading font-bold text-lm-text dark:text-[#FFF4E8] mb-2">{title}</h3>
                <p className="text-lm-muted dark:text-[#BFAEA3] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ── MEMBER DIRECTORY ─────────────────────── */}
        <ScrollReveal>
          <div className="glass-card p-8 md:p-10 flex flex-col sm:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-full bg-lm-accent/10 dark:bg-ember/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-8 h-8 text-lm-accent dark:text-ember" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8] mb-2">
                Meet the Community
              </h2>
              <p className="text-lm-muted dark:text-[#BFAEA3] text-sm leading-relaxed max-w-md">
                Browse the member directory to connect with fellow believers. Each profile is a story of faith.
              </p>
            </div>
            <Link
              href="/members"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-lm-accent dark:bg-ember text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              <Users className="w-4 h-4" /> View Members
            </Link>
          </div>
        </ScrollReveal>

        {/* ── CTA ──────────────────────────────────── */}
        <ScrollReveal>
          <div className="glass-card-gold gold-glow text-center p-12 md:p-16">
            <div className="flex justify-center mb-6">
              <Flame className="w-12 h-12 text-lm-accent dark:text-[#FF7A29]" />
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-lm-text dark:text-[#FFF4E8] mb-4">
              Ready to be part of this?
            </h2>
            <p className="text-lm-muted dark:text-[#BFAEA3] text-lg max-w-md mx-auto mb-10 leading-relaxed">
              Join a growing community of young believers. Your story, your questions, and your prayers are welcome here.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-10 py-4 bg-lm-accent dark:bg-[#FF7A29] text-white font-bold rounded-2xl hover:bg-secondary dark:hover:bg-[#F6B25E] dark:hover:text-[#0D0A0A] transition-all duration-300 shadow-xl shadow-lm-accent/20 dark:shadow-[#FF7A29]/20 text-base"
              >
                <Flame className="w-4 h-4" /> Join Fellowship
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-10 py-4 border border-lm-border dark:border-[#FFF4E8]/15 text-lm-text dark:text-[#FFF4E8] font-semibold rounded-2xl hover:bg-lm-accent/8 dark:hover:bg-[#FFF4E8]/8 transition-all duration-300 text-base"
              >
                Sign in
              </Link>
            </div>
            <p className="text-lm-muted/60 dark:text-[#BFAEA3]/60 text-sm mt-8 italic">
              Free to join. No obligation. Just community.
            </p>
          </div>
        </ScrollReveal>

      </div>
    </div>
  )
}
