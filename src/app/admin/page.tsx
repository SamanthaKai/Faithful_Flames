'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type Tab = 'verses' | 'articles' | 'devotions' | 'testimonies' | 'events' | 'forum' | 'accountability'

interface Testimony { id: string; content: string; isAnonymous: boolean; isApproved: boolean; createdAt: string; user: { name: string | null } }
interface Verse { id: string; reference: string; text: string; reflection: string; tags: string[]; isDaily: boolean }
interface Post { id: string; title: string; content: string; topic: string; isFlagged: boolean; user: { name: string | null } }
interface Event { id: string; title: string; description: string | null; date: string }

interface AccReq {
  id: string
  focus: string
  frequency: string
  notes: string | null
  status: 'PENDING' | 'MATCHED'
  user: { id: string; name: string | null; email: string }
  partner: { id: string; name: string | null; email: string } | null
}

const FOCUS_LABELS: Record<string, string> = {
  BIBLE_READING: 'Bible Reading', PRAYER: 'Prayer', FASTING: 'Fasting',
  PURITY: 'Purity', WORSHIP: 'Worship', OTHER: 'Other',
}
const FREQ_LABELS: Record<string, string> = {
  DAILY: 'Daily', WEEKLY: 'Weekly', BIWEEKLY: 'Bi-weekly',
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('testimonies')
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [verses, setVerses] = useState<Verse[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [accPending, setAccPending] = useState<AccReq[]>([])
  const [accMatched, setAccMatched] = useState<AccReq[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [matching, setMatching] = useState(false)

  // Verse form
  const [vForm, setVForm] = useState({ reference: '', text: '', reflection: '', tags: '', isDaily: false })
  // Article form
  const [aForm, setAForm] = useState({ title: '', content: '', category: '', isPublished: false })
  // Devotion form
  const [dForm, setDForm] = useState({ title: '', scripture: '', teaching: '', prayerPoint: '', reflectionQuestion: '', isPublished: false })
  // Event form
  const [eForm, setEForm] = useState({ title: '', description: '', date: '' })

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') { router.push('/'); return }
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return
    setLoading(true)
    const fetches: Record<Tab, () => Promise<void>> = {
      testimonies: () => fetch('/api/testimonies?all=true').then(r => r.json()).then(setTestimonies),
      verses: () => fetch('/api/verses').then(r => r.json()).then(setVerses),
      articles: () => Promise.resolve(),
      devotions: () => Promise.resolve(),
      events: () => fetch('/api/admin/events').then(r => r.json()).then(setEvents),
      forum: () => fetch('/api/forum/posts?flagged=true').then(r => r.json()).then(setPosts),
      accountability: () => fetch('/api/admin/accountability').then(r => r.json()).then(d => { setAccPending(d.pending ?? []); setAccMatched(d.matched ?? []) }),
    }
    fetches[tab]?.().finally(() => setLoading(false))
  }, [tab, status, session])

  const approveTestimony = async (id: string, approve: boolean) => {
    await fetch(`/api/admin/testimonies/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved: approve }) })
    setTestimonies(prev => prev.map(t => t.id === id ? { ...t, isApproved: approve } : t))
    toast.success(approve ? 'Approved!' : 'Unapproved.')
  }

  const deleteTestimony = async (id: string) => {
    if (!confirm('Delete this testimony?')) return
    await fetch(`/api/admin/testimonies/${id}`, { method: 'DELETE' })
    setTestimonies(prev => prev.filter(t => t.id !== id))
    toast.success('Deleted.')
  }

  const submitVerse = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/verses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vForm, tags: vForm.tags.split(',').map(t => t.trim()).filter(Boolean) }),
    })
    if (res.ok) { const v = await res.json(); setVerses(p => [v, ...p]); setVForm({ reference: '', text: '', reflection: '', tags: '', isDaily: false }); toast.success('Verse added!') }
  }

  const deleteVerse = async (id: string) => {
    if (!confirm('Delete this verse? This cannot be undone.')) return
    const res = await fetch(`/api/verses/${id}`, { method: 'DELETE' })
    if (res.ok) { setVerses(p => p.filter(v => v.id !== id)); toast.success('Verse deleted.') }
    else toast.error('Failed to delete verse.')
  }

  const toggleDailyVerse = async (id: string, current: boolean) => {
    const res = await fetch(`/api/verses/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDaily: !current }),
    })
    if (res.ok) { setVerses(p => p.map(v => v.id === id ? { ...v, isDaily: !current } : v)); toast.success(!current ? 'Set as daily verse.' : 'Removed from daily.') }
    else toast.error('Failed to update verse.')
  }

  const submitArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(aForm) })
    if (res.ok) { toast.success('Article saved!'); setAForm({ title: '', content: '', category: '', isPublished: false }) }
  }

  const submitDevotion = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/devotions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dForm) })
    if (res.ok) { toast.success('Devotion saved!'); setDForm({ title: '', scripture: '', teaching: '', prayerPoint: '', reflectionQuestion: '', isPublished: false }) }
  }

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(eForm) })
    if (res.ok) { const ev = await res.json(); setEvents(p => [...p, ev]); setEForm({ title: '', description: '', date: '' }); toast.success('Event added!') }
  }

  const toggleSelect = (userId: string) => {
    setSelectedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : prev.length < 2 ? [...prev, userId] : prev
    )
  }

  const handleMatch = async () => {
    if (selectedIds.length !== 2) return
    setMatching(true)
    const res = await fetch('/api/admin/accountability/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIdA: selectedIds[0], userIdB: selectedIds[1] }),
    })
    setMatching(false)
    if (res.ok) {
      toast.success('Partners matched! Both users have been notified by email.')
      setSelectedIds([])
      const data = await fetch('/api/admin/accountability').then(r => r.json())
      setAccPending(data.pending ?? [])
      setAccMatched(data.matched ?? [])
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to match.')
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/admin/forum/${id}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== id))
    toast.success('Post deleted.')
  }

  if (status === 'loading' || !session) return null

  const TABS: { id: Tab; label: string }[] = [
    { id: 'testimonies', label: 'Testimonies' },
    { id: 'verses', label: 'Verses' },
    { id: 'articles', label: 'Articles' },
    { id: 'devotions', label: 'Devotions' },
    { id: 'events', label: 'Events' },
    { id: 'forum', label: 'Forum' },
    { id: 'accountability', label: 'Accountability' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream">Admin Panel</h1>
          <p className="text-warm-gray text-sm">Manage content, testimonies, and community.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-[#231E1E] rounded-xl p-1 mb-8 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-white dark:bg-[#2D2323] text-primary shadow-sm' : 'text-warm-gray hover:text-charcoal dark:hover:text-cream'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="skeleton h-32 rounded-xl" />}

      {/* Testimonies */}
      {tab === 'testimonies' && !loading && (
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream">Pending & Approved Testimonies</h2>
          {testimonies.map(t => (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-charcoal dark:text-cream">{t.isAnonymous ? 'Anonymous' : t.user.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.isApproved ? 'Approved' : 'Pending'}</span>
                  </div>
                  <p className="text-charcoal dark:text-cream/80 text-sm leading-relaxed">{t.content}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!t.isApproved && <button onClick={() => approveTestimony(t.id, true)} className="btn-primary py-1 px-3 text-xs">Approve</button>}
                  {t.isApproved && <button onClick={() => approveTestimony(t.id, false)} className="btn-outline py-1 px-3 text-xs">Unapprove</button>}
                  <button onClick={() => deleteTestimony(t.id)} className="px-3 py-1 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {testimonies.length === 0 && <p className="text-warm-gray text-center py-8">No testimonies yet.</p>}
        </div>
      )}

      {/* Verses */}
      {tab === 'verses' && !loading && (
        <div>
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">Add Verse</h2>
          <form onSubmit={submitVerse} className="card p-6 space-y-4 mb-8">
            <input value={vForm.reference} onChange={e => setVForm(p => ({...p, reference: e.target.value}))} required className="input" placeholder="Reference (e.g. John 3:16)" />
            <textarea value={vForm.text} onChange={e => setVForm(p => ({...p, text: e.target.value}))} required rows={3} className="input resize-none" placeholder="Verse text" />
            <textarea value={vForm.reflection} onChange={e => setVForm(p => ({...p, reflection: e.target.value}))} required rows={3} className="input resize-none" placeholder="Short reflection" />
            <input value={vForm.tags} onChange={e => setVForm(p => ({...p, tags: e.target.value}))} className="input" placeholder="Tags (comma-separated: hope, love, strength)" />
            <label className="flex items-center gap-2 text-sm text-charcoal dark:text-cream cursor-pointer">
              <input type="checkbox" checked={vForm.isDaily} onChange={e => setVForm(p => ({...p, isDaily: e.target.checked}))} className="rounded" /> Set as today&apos;s verse
            </label>
            <button type="submit" className="btn-primary">Add Verse</button>
          </form>
          <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-3">All Verses ({verses.length})</h2>
          <div className="space-y-2">
            {verses.map(v => (
              <div key={v.id} className="card p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-primary text-sm">{v.reference}</p>
                  <p className="text-charcoal dark:text-cream/80 text-xs line-clamp-1">{v.text}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {v.isDaily && <span className="tag text-xs">Daily</span>}
                  <button
                    type="button"
                    onClick={() => toggleDailyVerse(v.id, v.isDaily)}
                    className="px-3 py-1 rounded-lg border border-lm-border dark:border-ember/20 text-xs text-warm-gray hover:text-primary transition-colors"
                  >
                    {v.isDaily ? 'Unset daily' : 'Set daily'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteVerse(v.id)}
                    className="px-3 py-1 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {verses.length === 0 && <p className="text-warm-gray text-center py-8">No verses yet.</p>}
          </div>
        </div>
      )}

      {/* Articles */}
      {tab === 'articles' && !loading && (
        <div>
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">Write Article</h2>
          <form onSubmit={submitArticle} className="card p-6 space-y-4">
            <input value={aForm.title} onChange={e => setAForm(p => ({...p, title: e.target.value}))} required className="input" placeholder="Title" />
            <input value={aForm.category} onChange={e => setAForm(p => ({...p, category: e.target.value}))} required className="input" placeholder="Category (e.g. Faith & Culture)" />
            <textarea value={aForm.content} onChange={e => setAForm(p => ({...p, content: e.target.value}))} required rows={10} className="input resize-none" placeholder="Article content (use double line breaks for paragraphs)" />
            <label className="flex items-center gap-2 text-sm text-charcoal dark:text-cream cursor-pointer">
              <input type="checkbox" checked={aForm.isPublished} onChange={e => setAForm(p => ({...p, isPublished: e.target.checked}))} className="rounded" /> Publish immediately
            </label>
            <button type="submit" className="btn-primary">Save Article</button>
          </form>
        </div>
      )}

      {/* Devotions */}
      {tab === 'devotions' && !loading && (
        <div>
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">Write Devotion</h2>
          <form onSubmit={submitDevotion} className="card p-6 space-y-4">
            <input value={dForm.title} onChange={e => setDForm(p => ({...p, title: e.target.value}))} required className="input" placeholder="Title" />
            <input value={dForm.scripture} onChange={e => setDForm(p => ({...p, scripture: e.target.value}))} required className="input" placeholder="Scripture reference (e.g. Psalm 23:1-3)" />
            <textarea value={dForm.teaching} onChange={e => setDForm(p => ({...p, teaching: e.target.value}))} required rows={6} className="input resize-none" placeholder="Main teaching / reflection" />
            <textarea value={dForm.prayerPoint} onChange={e => setDForm(p => ({...p, prayerPoint: e.target.value}))} required rows={3} className="input resize-none" placeholder="Prayer point" />
            <input value={dForm.reflectionQuestion} onChange={e => setDForm(p => ({...p, reflectionQuestion: e.target.value}))} required className="input" placeholder="Reflection question" />
            <label className="flex items-center gap-2 text-sm text-charcoal dark:text-cream cursor-pointer">
              <input type="checkbox" checked={dForm.isPublished} onChange={e => setDForm(p => ({...p, isPublished: e.target.checked}))} className="rounded" /> Publish immediately
            </label>
            <button type="submit" className="btn-primary">Save Devotion</button>
          </form>
        </div>
      )}

      {/* Events */}
      {tab === 'events' && !loading && (
        <div>
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">Add Event</h2>
          <form onSubmit={submitEvent} className="card p-6 space-y-4 mb-8">
            <input value={eForm.title} onChange={e => setEForm(p => ({...p, title: e.target.value}))} required className="input" placeholder="Event title" />
            <input value={eForm.description} onChange={e => setEForm(p => ({...p, description: e.target.value}))} className="input" placeholder="Short description (optional)" />
            <input type="datetime-local" value={eForm.date} onChange={e => setEForm(p => ({...p, date: e.target.value}))} required className="input" />
            <button type="submit" className="btn-primary">Add Event</button>
          </form>
          <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-3">Upcoming Events</h2>
          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-charcoal dark:text-cream text-sm">{ev.title}</p>
                  <p className="text-warm-gray text-xs">{new Date(ev.date).toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accountability */}
      {tab === 'accountability' && !loading && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream">
                Pending Requests ({accPending.length})
              </h2>
              {selectedIds.length === 2 && (
                <button
                  type="button"
                  onClick={handleMatch}
                  disabled={matching}
                  className="btn-primary text-sm px-4 py-2"
                >
                  {matching ? 'Matching...' : 'Match selected pair'}
                </button>
              )}
            </div>
            {accPending.length === 0 ? (
              <p className="text-warm-gray text-center py-8">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {accPending.map(req => {
                  const selected = selectedIds.includes(req.user.id)
                  return (
                    <button
                      key={req.id}
                      type="button"
                      onClick={() => toggleSelect(req.user.id)}
                      className={`w-full text-left card p-4 transition-all border-2 ${selected ? 'border-primary' : 'border-transparent'}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-charcoal dark:text-cream text-sm">{req.user.name ?? 'Unknown'}</p>
                          <p className="text-xs text-warm-gray">{req.user.email}</p>
                          <div className="flex gap-3 mt-1 text-xs text-warm-gray">
                            <span><strong className="text-charcoal dark:text-cream">Focus:</strong> {FOCUS_LABELS[req.focus] ?? req.focus}</span>
                            <span><strong className="text-charcoal dark:text-cream">Frequency:</strong> {FREQ_LABELS[req.frequency] ?? req.frequency}</span>
                          </div>
                          {req.notes && <p className="text-xs text-warm-gray mt-1 italic">{req.notes}</p>}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                          {selected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            {selectedIds.length > 0 && selectedIds.length < 2 && (
              <p className="text-xs text-warm-gray mt-2">Select one more person to create a pair.</p>
            )}
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">
              Matched Pairs ({accMatched.length})
            </h2>
            {accMatched.length === 0 ? (
              <p className="text-warm-gray text-center py-8">No matched pairs yet.</p>
            ) : (
              <div className="space-y-3">
                {accMatched.map(req => (
                  <div key={req.id} className="card p-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-semibold text-charcoal dark:text-cream">{req.user.name ?? req.user.email}</span>
                      <span className="text-warm-gray">+</span>
                      <span className="font-semibold text-charcoal dark:text-cream">{req.partner?.name ?? req.partner?.email ?? 'Unknown'}</span>
                      <span className="ml-auto text-xs text-warm-gray">{FOCUS_LABELS[req.focus] ?? req.focus} · {FREQ_LABELS[req.frequency] ?? req.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forum moderation */}
      {tab === 'forum' && !loading && (
        <div>
          <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-4">Flagged Posts</h2>
          <div className="space-y-4">
            {posts.filter(p => p.isFlagged).map(p => (
              <div key={p.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-charcoal dark:text-cream text-sm">{p.title}</p>
                    <p className="text-warm-gray text-xs">{p.user.name}</p>
                    <p className="text-charcoal dark:text-cream/80 text-sm mt-1">{p.content}</p>
                  </div>
                  <button onClick={() => deletePost(p.id)} className="px-3 py-1 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 transition-colors flex-shrink-0">Delete</button>
                </div>
              </div>
            ))}
            {posts.filter(p => p.isFlagged).length === 0 && <p className="text-warm-gray text-center py-8">No flagged posts.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
