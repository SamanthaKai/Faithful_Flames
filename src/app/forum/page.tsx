'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { FORUM_TOPICS } from '@/lib/forum-topics'

const TOPICS = FORUM_TOPICS

interface Post {
  id: string
  title: string
  content: string
  topic: string
  createdAt: string
  user: { name: string | null; image: string | null }
  _count: { replies: number }
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function ForumContent() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', topic: '' })
  const [submitting, setSubmitting] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('ff_community_welcomed')) setShowWelcomeModal(true)
  }, [])

  const dismissModal = () => {
    localStorage.setItem('ff_community_welcomed', '1')
    setShowWelcomeModal(false)
  }

  const loadPosts = (topic: string | null = null) => {
    setLoading(true)
    const url = topic ? `/api/forum/posts?topic=${topic}` : '/api/forum/posts'
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false) })
  }

  useEffect(() => { loadPosts() }, [])

  const handleTopicFilter = (topic: string | null) => {
    setActiveTopic(topic)
    loadPosts(topic)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.topic) { toast.error('Please select a topic.'); return }
    setSubmitting(true)
    const res = await fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSubmitting(false)
    if (res.ok) {
      const post = await res.json()
      setPosts((prev) => [{ ...post, _count: { replies: 0 } }, ...prev])
      toast.success('Post created!')
      setShowForm(false)
      setForm({ title: '', content: '', topic: '' })
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to create post.')
    }
  }

  const topicMeta = (value: string) => TOPICS.find((t) => t.value === value)

  return (
    <>
      {/* Welcome modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-lm-card dark:bg-[#161111] border border-lm-border dark:border-ember/15 rounded-2xl max-w-lg w-full p-8 animate-slide-up max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-4xl">🔥</span>
              <h2 className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8] mt-3 mb-2">
                Welcome to the Community
              </h2>
              <p className="text-lm-muted dark:text-[#BFAEA3] text-sm leading-relaxed">
                A safe space for young believers to connect, share, and grow together.
                We&apos;re here to encourage — not debate or judge. Come as you are.
              </p>
            </div>
            <ol className="space-y-3 mb-6">
              {[
                'Speak with love. Disagreement is okay; disrespect is not.',
                'Keep it faith-centered. This space is about Jesus.',
                'No spam or self-promotion. Share with intention.',
                "Protect one another's stories. What's shared here, stays here.",
                'Testimonies are sacred. Receive them with grace.',
                'If something feels wrong, report it.',
              ].map((rule, i) => (
                <li key={i} className="flex gap-3 text-sm text-lm-text dark:text-[#FFF4E8]">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-lm-accent/15 dark:bg-ember/15 text-lm-accent dark:text-ember text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {rule}
                </li>
              ))}
            </ol>
            <button type="button" onClick={dismissModal} className="w-full py-3 bg-lm-accent dark:bg-ember text-white font-bold rounded-xl hover:opacity-90 transition-opacity mb-3">
              I understand — let me in
            </button>
            <p className="text-xs text-lm-muted dark:text-[#BFAEA3] text-center">
              By entering, you agree to honor this community.
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-cream dark:bg-[#0D0A0A]">

        {/* ── Page Hero ───────────────────────────────────────── */}
        <div className="page-hero">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-lm-accent dark:text-ember mb-3 block">
                💬 Community
              </span>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-lm-text dark:text-[#FFF4E8] mb-3">
                Community Forum
              </h1>
              <p className="text-lm-muted dark:text-[#BFAEA3] text-base max-w-lg leading-relaxed">
                Ask, pray, encourage, and grow — together. This is the most alive place on the platform.
              </p>
            </div>
            {session ? (
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-lm-accent dark:bg-ember text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                + New Post
              </button>
            ) : (
              <Link href="/login" className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-lm-accent dark:bg-ember text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity">
                Sign in to post
              </Link>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Topic filter pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              type="button"
              onClick={() => handleTopicFilter(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                activeTopic === null
                  ? 'bg-lm-accent dark:bg-ember text-white border-lm-accent dark:border-ember'
                  : 'bg-transparent text-lm-muted dark:text-[#BFAEA3] border-lm-border dark:border-[#FF7A29]/15 hover:border-lm-accent dark:hover:border-ember hover:text-lm-accent dark:hover:text-ember'
              }`}
            >
              All
            </button>
            {TOPICS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleTopicFilter(t.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  activeTopic === t.value
                    ? 'bg-lm-accent dark:bg-ember text-white border-lm-accent dark:border-ember'
                    : 'bg-transparent text-lm-muted dark:text-[#BFAEA3] border-lm-border dark:border-[#FF7A29]/15 hover:border-lm-accent dark:hover:border-ember hover:text-lm-accent dark:hover:text-ember'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* New post form */}
          {showForm && (
            <div className="card p-6 mb-8 animate-slide-up">
              <h2 className="font-heading text-xl font-bold text-lm-text dark:text-[#FFF4E8] mb-5">New Post</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <select
                  value={form.topic}
                  onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                  required
                  aria-label="Topic"
                  className="input"
                >
                  <option value="">Select a topic…</option>
                  {TOPICS.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </select>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  className="input"
                  placeholder="Post title"
                />
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  required
                  rows={4}
                  className="input resize-none"
                  placeholder="What's on your heart?"
                />
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Posting…' : 'Post'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Posts list */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card p-5">
                  <div className="flex gap-4">
                    <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <div className="skeleton h-5 w-24 rounded-full" />
                        <div className="skeleton h-5 w-16 rounded-full" />
                      </div>
                      <div className="skeleton h-5 w-3/4 rounded" />
                      <div className="skeleton h-4 w-full rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                const meta = topicMeta(post.topic)
                const initial = (post.user.name?.[0] ?? '?').toUpperCase()
                const isPrayer = post.topic === 'PRAYER_REQUESTS'

                return (
                  <Link key={post.id} href={`/forum/${post.id}`} className="block group">
                    <article className={`card p-5 border-l-4 ${
                      isPrayer
                        ? 'border-l-amber-400 dark:border-l-[#F6B25E]'
                        : 'border-l-lm-accent dark:border-l-ember'
                    }`}>
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {post.user.image ? (
                            <Image src={post.user.image} alt="" width={40} height={40} className="rounded-full ring-2 ring-lm-border dark:ring-ember/20" />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isPrayer ? 'bg-amber-100 dark:bg-[#F6B25E]/15 text-amber-700 dark:text-[#F6B25E]' : 'bg-lm-accent/15 dark:bg-ember/15 text-lm-accent dark:text-ember'}`}>
                              {initial}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Meta row */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {meta && (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isPrayer ? meta.light + ' dark:' + meta.dark.replace('dark:', '') : meta.light + ' dark:' + meta.dark.replace('dark:', '')}`}>
                                {meta.icon} {meta.label}
                              </span>
                            )}
                            <span className="text-xs text-lm-muted dark:text-[#BFAEA3]">
                              {post.user.name} · {timeAgo(post.createdAt)}
                            </span>
                          </div>

                          {/* Title */}
                          <h2 className="font-heading text-base font-bold text-lm-text dark:text-[#FFF4E8] group-hover:text-lm-accent dark:group-hover:text-ember transition-colors mb-1 leading-snug">
                            {post.title}
                          </h2>

                          {/* Preview */}
                          <p className="text-lm-muted dark:text-[#BFAEA3] text-sm line-clamp-2 leading-relaxed">
                            {post.content}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-lm-muted dark:text-[#BFAEA3]">
                            <span>💬 {post._count.replies} {post._count.replies === 1 ? 'reply' : 'replies'}</span>
                            {post._count.replies > 5 && (
                              <span className="text-lm-accent dark:text-ember font-semibold">🔥 Active</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}

              {posts.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-5xl mb-5">💬</p>
                  <h3 className="font-heading text-xl font-bold text-lm-text dark:text-[#FFF4E8] mb-2">
                    Be the first voice in this fellowship
                  </h3>
                  <p className="text-lm-muted dark:text-[#BFAEA3] text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                    {activeTopic
                      ? 'No posts in this category yet. Start the conversation.'
                      : 'Your questions and prayers belong here. Share what\'s on your heart.'}
                  </p>
                  {session && (
                    <button type="button" onClick={() => setShowForm(true)} className="btn-primary">
                      Start the conversation
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function ForumPage() {
  return (
    <Suspense>
      <ForumContent />
    </Suspense>
  )
}
