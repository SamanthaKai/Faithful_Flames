'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const TOPICS = [
  { value: 'PRAYER_REQUESTS', label: 'Prayer Requests', color: 'bg-blue-100 text-blue-700' },
  { value: 'BIBLE_QUESTIONS', label: 'Bible Questions', color: 'bg-green-100 text-green-700' },
  { value: 'ACCOUNTABILITY', label: 'Accountability', color: 'bg-purple-100 text-purple-700' },
  { value: 'TESTIMONIES', label: 'Testimonies', color: 'bg-orange-100 text-orange-700' },
]

interface Post {
  id: string
  title: string
  content: string
  topic: string
  createdAt: string
  user: { name: string | null; image: string | null }
  _count: { replies: number }
}

export default function ForumPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', topic: '' })
  const [submitting, setSubmitting] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('ff_community_welcomed')) {
      setShowWelcomeModal(true)
    }
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
    {showWelcomeModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="card max-w-lg w-full p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
          <h2 className="font-heading text-2xl font-bold text-charcoal dark:text-cream mb-4 text-center">
            Welcome to Faithful Flames Community
          </h2>
          <p className="text-warm-gray text-sm leading-relaxed mb-6 text-center">
            This is a safe space for young believers to connect, share, and grow together
            in faith. We&apos;re here to encourage one another — not debate, not judge.
            Come as you are.
          </p>
          <ol className="space-y-3 mb-6">
            {[
              'Speak with love. Disagreement is okay; disrespect is not.',
              'Keep it faith-centered. Stay on topic — this space is about Jesus.',
              'No spam or self-promotion. Share with intention, not agenda.',
              "Protect one another's stories. What's shared here, stays here.",
              'Testimonies are sacred. Receive them with grace, not criticism.',
              'If something feels wrong, report it. We moderate with care.',
            ].map((rule, i) => (
              <li key={i} className="flex gap-3 text-sm text-charcoal dark:text-cream">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
          <button type="button" onClick={dismissModal} className="btn-primary w-full mb-4">
            I understand, let me in
          </button>
          <p className="text-xs text-warm-gray text-center">
            By entering, you agree to honor this community and the people in it.
          </p>
        </div>
      </div>
    )}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title text-4xl mb-2">Community Forum</h1>
          <p className="text-warm-gray">Ask, pray, encourage, and grow — together.</p>
        </div>
        {session ? (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary whitespace-nowrap">
            + New Post
          </button>
        ) : (
          <Link href="/login" className="btn-primary">Sign in to post</Link>
        )}
      </div>

      {/* Topic filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleTopicFilter(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            activeTopic === null ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-[#231E1E] text-warm-gray border-gray-200 dark:border-[#3A3030] hover:border-primary hover:text-primary'
          }`}
        >
          All
        </button>
        {TOPICS.map((t) => (
          <button
            key={t.value}
            onClick={() => handleTopicFilter(t.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeTopic === t.value ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-[#231E1E] text-warm-gray border-gray-200 dark:border-[#3A3030] hover:border-primary hover:text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* New post form */}
      {showForm && (
        <div className="card p-6 mb-8 animate-slide-up">
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">New Post</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={form.topic}
              onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
              required
              className="input"
            >
              <option value="">Select a topic…</option>
              {TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
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
              placeholder="What's on your mind?"
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-4 w-24 rounded mb-3" />
              <div className="skeleton h-5 w-3/4 rounded mb-2" />
              <div className="skeleton h-4 w-full rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const meta = topicMeta(post.topic)
            const initial = (post.user.name?.[0] ?? '?').toUpperCase()
            return (
              <Link key={post.id} href={`/forum/${post.id}`} className="card p-5 block group">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {meta && <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>{meta.label}</span>}
                      <span className="text-xs text-warm-gray">{post.user.name} · {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <h2 className="font-heading text-base font-bold text-charcoal dark:text-cream group-hover:text-primary transition-colors mb-1">
                      {post.title}
                    </h2>
                    <p className="text-warm-gray text-sm line-clamp-2">{post.content}</p>
                    <p className="text-xs text-warm-gray mt-2">{post._count.replies} {post._count.replies === 1 ? 'reply' : 'replies'}</p>
                  </div>
                </div>
              </Link>
            )
          })}

          {posts.length === 0 && (
            <div className="text-center py-16 text-warm-gray">
              <p className="text-lg mb-4">No posts yet in this category.</p>
              {session && <button onClick={() => setShowForm(true)} className="btn-primary">Start the conversation</button>}
            </div>
          )}
        </div>
      )}
    </div>
    </>
  )
}
