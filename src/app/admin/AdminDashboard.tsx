'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

type Tab = 'overview' | 'devotions' | 'prayer' | 'testimonies' | 'comments' | 'articles'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'devotions', label: 'Devotions' },
  { id: 'prayer', label: 'Prayer requests' },
  { id: 'testimonies', label: 'Testimonies' },
  { id: 'comments', label: 'Comments' },
  { id: 'articles', label: 'Articles' },
]

async function api<T = unknown>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`)
  return data as T
}

function useLoad<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const reload = useCallback(() => {
    api<T>(url).then(setData).catch((e) => toast.error(e.message))
  }, [url])
  useEffect(reload, [reload])
  return { data, reload }
}

const fmtDate = (iso: string) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kampala' })
const fmtDay = (key: string) => new Date(`${key}T12:00:00+03:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Kampala' })

function Badge({ tone, children }: { tone: 'ember' | 'green' | 'gray' | 'red'; children: React.ReactNode }) {
  const c = {
    ember: 'bg-ember/15 text-ember',
    green: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    gray: 'bg-lm-border/60 text-lm-muted dark:bg-white/10 dark:text-[#BFAEA3]',
    red: 'bg-red-500/15 text-red-700 dark:text-red-400',
  }[tone]
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c}`}>{children}</span>
}

export function AdminDashboard({ today }: { today: string }) {
  const [tab, setTab] = useState<Tab>('overview')
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="kicker mb-2">Faithful Flames</p>
      <h1 className="font-heading text-3xl font-bold text-lm-text dark:text-[#FFF4E8]">Admin</h1>
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-lm-border dark:border-ember/10" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${
              tab === t.id ? 'border-ember text-lm-text dark:text-[#FFF4E8]' : 'border-transparent text-lm-muted hover:text-lm-text dark:text-[#BFAEA3]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="py-8">
        {tab === 'overview' && <Overview go={setTab} />}
        {tab === 'devotions' && <Devotions today={today} />}
        {tab === 'prayer' && <Prayer />}
        {tab === 'testimonies' && <Testimonies />}
        {tab === 'comments' && <Comments />}
        {tab === 'articles' && <Articles />}
      </div>
    </div>
  )
}

// ── Overview ──────────────────────────────────────────────────────────────
type Stats = {
  today: string
  days: { day: string; visitors: number; views: number }[]
  pendingTestimonies: number
  pendingPrayer: number
  openReports: number
  todaysDevotion: { id: string; title: string; isPublished: boolean } | null
}

function Overview({ go }: { go: (t: Tab) => void }) {
  const { data } = useLoad<Stats>('/api/admin/stats')
  if (!data) return <p className="text-sm text-lm-muted">Loading…</p>
  const todayRow = data.days[data.days.length - 1]
  const week = data.days.slice(-7).reduce((s, d) => s + d.visitors, 0)
  const max = Math.max(1, ...data.days.map((d) => d.visitors))

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Visitors today" value={todayRow?.visitors ?? 0} sub={`${todayRow?.views ?? 0} page views`} />
        <Stat label="Visitors, last 7 days" value={week} sub="Unique per day, summed" />
        <Stat label="Waiting for review" value={data.pendingTestimonies + data.pendingPrayer}
          sub={`${data.pendingTestimonies} testimonies · ${data.pendingPrayer} prayer`} onClick={() => go(data.pendingTestimonies ? 'testimonies' : 'prayer')} />
        <Stat label="Reported comments" value={data.openReports} sub="Unresolved" onClick={() => go('comments')} alert={data.openReports > 0} />
      </div>

      <div className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="kicker mb-1">Today ({fmtDay(data.today)})</p>
            {data.todaysDevotion ? (
              <p className="font-semibold text-lm-text dark:text-[#FFF4E8]">
                {data.todaysDevotion.title}{' '}
                {data.todaysDevotion.isPublished ? <Badge tone="green">Published</Badge> : <Badge tone="gray">Draft</Badge>}
              </p>
            ) : (
              <p className="font-semibold text-red-700 dark:text-red-400">No devotion for today yet.</p>
            )}
          </div>
          <button type="button" className="btn-ghost !py-2 text-xs" onClick={() => go('devotions')}>Manage devotions</button>
        </div>
      </div>

      <div className="panel p-5">
        <p className="kicker mb-4">Daily visitors (last 14 days, Kampala time)</p>
        <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Bar chart of daily visitors over the last 14 days">
          {data.days.map((d) => (
            <div key={d.day} className="group flex flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] tabular-nums text-lm-muted opacity-0 group-hover:opacity-100 dark:text-[#BFAEA3]">{d.visitors}</span>
              <div className="w-full rounded-t bg-ember/80" style={{ height: `${Math.max(2, (d.visitors / max) * 120)}px` }} title={`${fmtDay(d.day)}: ${d.visitors} visitors, ${d.views} views`} />
              <span className="text-[9px] text-lm-muted dark:text-[#BFAEA3]">{d.day.slice(8)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, sub, onClick, alert }: { label: string; value: number; sub: string; onClick?: () => void; alert?: boolean }) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp type={onClick ? 'button' : undefined} onClick={onClick} className={`panel p-5 text-left ${onClick ? 'hover:border-ember' : ''}`}>
      <p className="text-xs font-semibold text-lm-muted dark:text-[#BFAEA3]">{label}</p>
      <p className={`mt-1 font-heading text-4xl font-bold tabular-nums ${alert ? 'text-red-600' : 'text-lm-text dark:text-[#FFF4E8]'}`}>{value}</p>
      <p className="mt-1 text-xs text-lm-muted dark:text-[#BFAEA3]">{sub}</p>
    </Comp>
  )
}

// ── Devotions ─────────────────────────────────────────────────────────────
type Devotion = {
  id: string; title: string; scripture: string; scriptureText: string | null; teaching: string
  application: string | null; prayerPoint: string | null; reflectionQuestion: string | null
  dayKey: string | null; publishedAt: string; isPublished: boolean; commentCount: number
}
const emptyDevotion = (day: string) => ({ dayKey: day, title: '', scripture: '', scriptureText: '', teaching: '', application: '', prayerPoint: '', isPublished: true })

function Devotions({ today }: { today: string }) {
  const { data, reload } = useLoad<Devotion[]>('/api/admin/devotions')
  const [editing, setEditing] = useState<{ id: string | null; form: ReturnType<typeof emptyDevotion> } | null>(null)
  const [busy, setBusy] = useState(false)

  const startNew = () => {
    const taken = new Set((data ?? []).map((d) => d.dayKey))
    let day = today
    for (let i = 0; taken.has(day) && i < 60; i++) day = new Date(new Date(`${day}T12:00:00+03:00`).getTime() + 86_400_000).toISOString().slice(0, 10)
    setEditing({ id: null, form: emptyDevotion(day) })
  }
  const startEdit = (d: Devotion) =>
    setEditing({
      id: d.id,
      form: {
        dayKey: d.dayKey ?? new Date(d.publishedAt).toLocaleDateString('en-CA', { timeZone: 'Africa/Kampala' }),
        title: d.title, scripture: d.scripture, scriptureText: d.scriptureText ?? '', teaching: d.teaching,
        application: d.application ?? (d.reflectionQuestion ? `Reflect: ${d.reflectionQuestion}` : ''), prayerPoint: d.prayerPoint ?? '', isPublished: d.isPublished,
      },
    })

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setBusy(true)
    try {
      if (editing.id) await api(`/api/admin/devotions/${editing.id}`, 'PATCH', editing.form)
      else await api('/api/admin/devotions', 'POST', editing.form)
      toast.success(editing.form.isPublished ? 'Devotion saved and published' : 'Draft saved')
      setEditing(null)
      reload()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const togglePublish = async (d: Devotion) => {
    try {
      await api(`/api/admin/devotions/${d.id}`, 'PATCH', { isPublished: !d.isPublished })
      toast.success(d.isPublished ? 'Unpublished' : 'Published')
      reload()
    } catch (err) { toast.error((err as Error).message) }
  }
  const remove = async (d: Devotion) => {
    if (!confirm(`Delete "${d.title}"? This cannot be undone.`)) return
    try { await api(`/api/admin/devotions/${d.id}`, 'DELETE'); toast.success('Deleted'); reload() } catch (err) { toast.error((err as Error).message) }
  }

  if (editing) {
    const f = editing.form
    const set = (k: keyof typeof f, v: string | boolean) => setEditing({ ...editing, form: { ...f, [k]: v } })
    return (
      <form onSubmit={save} className="panel max-w-3xl space-y-5 p-6">
        <h2 className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">{editing.id ? 'Edit devotion' : 'New devotion'}</h2>
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <div>
            <label className="field-label" htmlFor="dv-day">Date (Kampala)</label>
            <input id="dv-day" type="date" required value={f.dayKey} onChange={(e) => set('dayKey', e.target.value)} className="input" />
          </div>
          <div>
            <label className="field-label" htmlFor="dv-title">Title</label>
            <input id="dv-title" required minLength={3} maxLength={140} value={f.title} onChange={(e) => set('title', e.target.value)} className="input" />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="dv-ref">Bible reference</label>
          <input id="dv-ref" required maxLength={80} value={f.scripture} onChange={(e) => set('scripture', e.target.value)} className="input" placeholder="e.g. Isaiah 43:2 (NIV)" />
        </div>
        <div>
          <label className="field-label" htmlFor="dv-text">Scripture text</label>
          <textarea id="dv-text" required rows={3} maxLength={3000} value={f.scriptureText} onChange={(e) => set('scriptureText', e.target.value)} className="input scripture text-lg" />
        </div>
        <div>
          <label className="field-label" htmlFor="dv-teach">Reflection</label>
          <p className="hint mb-1.5">Leave a blank line between paragraphs.</p>
          <textarea id="dv-teach" required rows={10} maxLength={15000} value={f.teaching} onChange={(e) => set('teaching', e.target.value)} className="input leading-relaxed" />
        </div>
        <div>
          <label className="field-label" htmlFor="dv-app">Practical application <span className="font-normal text-lm-muted dark:text-[#BFAEA3]">(optional)</span></label>
          <textarea id="dv-app" rows={3} maxLength={5000} value={f.application} onChange={(e) => set('application', e.target.value)} className="input" />
        </div>
        <div>
          <label className="field-label" htmlFor="dv-pr">Closing prayer <span className="font-normal text-lm-muted dark:text-[#BFAEA3]">(optional)</span></label>
          <textarea id="dv-pr" rows={3} maxLength={5000} value={f.prayerPoint} onChange={(e) => set('prayerPoint', e.target.value)} className="input" />
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold text-lm-text dark:text-[#FFF4E8]">
          <input type="checkbox" className="check" checked={f.isPublished} onChange={(e) => set('isPublished', e.target.checked)} />
          Published (appears on its date; future dates stay hidden until that day)
        </label>
        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="btn-ember">{busy ? 'Saving…' : 'Save'}</button>
          <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-lm-muted dark:text-[#BFAEA3]">One devotion per day. Each day&rsquo;s discussion closes at midnight, Kampala time.</p>
        <button type="button" onClick={startNew} className="btn-ember !py-2.5 text-xs">+ New devotion</button>
      </div>
      {!data ? <p className="text-sm text-lm-muted">Loading…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-lm-muted dark:text-[#BFAEA3]">
              <tr><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Devotion</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Comments</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-lm-border dark:divide-ember/10">
              {data.map((d) => {
                const day = d.dayKey ?? new Date(d.publishedAt).toLocaleDateString('en-CA', { timeZone: 'Africa/Kampala' })
                return (
                  <tr key={d.id} className="align-top">
                    <td className="whitespace-nowrap py-3 pr-4 text-lm-muted dark:text-[#BFAEA3]">{fmtDay(day)}</td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-lm-text dark:text-[#FFF4E8]">{d.title}</p>
                      <p className="text-xs text-ember">{d.scripture}</p>
                    </td>
                    <td className="py-3 pr-4 space-x-1">
                      {d.isPublished ? <Badge tone="green">Published</Badge> : <Badge tone="gray">Draft</Badge>}
                      {day === today && <Badge tone="ember">Today</Badge>}
                      {day > today && <Badge tone="gray">Scheduled</Badge>}
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{d.commentCount}</td>
                    <td className="whitespace-nowrap py-3 text-right text-xs font-semibold">
                      <button type="button" onClick={() => startEdit(d)} className="mr-3 text-ember hover:underline">Edit</button>
                      <button type="button" onClick={() => togglePublish(d)} className="mr-3 text-lm-muted hover:underline dark:text-[#BFAEA3]">{d.isPublished ? 'Unpublish' : 'Publish'}</button>
                      {d.isPublished && day <= today && <Link href={`/devotions/${d.id}`} className="mr-3 text-lm-muted hover:underline dark:text-[#BFAEA3]">View</Link>}
                      {d.commentCount === 0 && <button type="button" onClick={() => remove(d)} className="text-red-600 hover:underline">Delete</button>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {data.length === 0 && <p className="py-6 text-sm text-lm-muted">No devotions yet.</p>}
        </div>
      )}
    </div>
  )
}

// ── Prayer ────────────────────────────────────────────────────────────────
type PrayerRow = {
  id: string; name: string | null; content: string; isAnonymous: boolean; isPrivate: boolean; shareConsent: boolean
  status: 'PENDING' | 'APPROVED' | 'ARCHIVED'; createdAt: string; user: { email: string; name: string | null } | null; _count: { prayers: number }
}

function Prayer() {
  const { data, reload } = useLoad<PrayerRow[]>('/api/admin/prayer')
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'ARCHIVED' | 'ALL'>('PENDING')
  const setStatus = async (id: string, status: PrayerRow['status']) => {
    try { await api(`/api/admin/prayer/${id}`, 'PATCH', { status }); reload() } catch (e) { toast.error((e as Error).message) }
  }
  const remove = async (id: string) => {
    if (!confirm('Delete this prayer request permanently?')) return
    try { await api(`/api/admin/prayer/${id}`, 'DELETE'); reload() } catch (e) { toast.error((e as Error).message) }
  }
  const rows = (data ?? []).filter((r) => filter === 'ALL' || r.status === filter)

  return (
    <div>
      <Filter value={filter} onChange={setFilter} options={['PENDING', 'APPROVED', 'ARCHIVED', 'ALL']} counts={data ? {
        PENDING: data.filter((r) => r.status === 'PENDING').length,
      } : {}} />
      <p className="mb-5 text-xs text-lm-muted dark:text-[#BFAEA3]">
        &ldquo;Approve&rdquo; marks a request as reviewed. It appears on the public wall <strong>only</strong> if the person consented
        to sharing and did not mark it private. Private requests are never shown publicly.
      </p>
      {!data ? <p className="text-sm text-lm-muted">Loading…</p> : rows.length === 0 ? <p className="text-sm text-lm-muted">Nothing here.</p> : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const isPublic = r.status === 'APPROVED' && !r.isPrivate && r.shareConsent
            return (
              <li key={r.id} className="panel p-5">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  {r.isPrivate ? <Badge tone="red">Private</Badge> : r.shareConsent ? <Badge tone="ember">May be shared</Badge> : <Badge tone="gray">No consent to share</Badge>}
                  {r.isAnonymous && <Badge tone="gray">Anonymous</Badge>}
                  {isPublic && <Badge tone="green">On public wall</Badge>}
                  <span className="ml-auto text-xs text-lm-muted dark:text-[#BFAEA3]">{fmtDate(r.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-lm-text dark:text-[#FFF4E8]">{r.content}</p>
                <p className="mt-2 text-xs text-lm-muted dark:text-[#BFAEA3]">
                  From {r.name ?? 'no name given'}{r.user ? ` (${r.user.email})` : ' (visitor)'} · prayed for {r._count.prayers}×
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                  {r.status !== 'APPROVED' && <button type="button" onClick={() => setStatus(r.id, 'APPROVED')} className="text-emerald-700 hover:underline dark:text-emerald-400">Approve</button>}
                  {r.status !== 'ARCHIVED' && <button type="button" onClick={() => setStatus(r.id, 'ARCHIVED')} className="text-lm-muted hover:underline dark:text-[#BFAEA3]">Archive{isPublic ? ' (remove from wall)' : ''}</button>}
                  {r.status !== 'PENDING' && <button type="button" onClick={() => setStatus(r.id, 'PENDING')} className="text-lm-muted hover:underline dark:text-[#BFAEA3]">Back to pending</button>}
                  <button type="button" onClick={() => remove(r.id)} className="text-red-600 hover:underline">Delete</button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ── Testimonies ───────────────────────────────────────────────────────────
type TestimonyRow = {
  id: string; title: string | null; content: string; displayName: string | null; isAnonymous: boolean
  isApproved: boolean; reviewedAt: string | null; createdAt: string; user: { name: string | null; email: string } | null
}

function Testimonies() {
  const { data, reload } = useLoad<TestimonyRow[]>('/api/admin/testimonies')
  const [filter, setFilter] = useState<'PENDING' | 'PUBLISHED' | 'REJECTED' | 'ALL'>('PENDING')
  const state = (t: TestimonyRow) => (t.isApproved ? 'PUBLISHED' : t.reviewedAt ? 'REJECTED' : 'PENDING')
  const act = async (id: string, action: 'approve' | 'reject' | 'pending') => {
    try { await api(`/api/admin/testimonies/${id}`, 'PATCH', { action }); reload() } catch (e) { toast.error((e as Error).message) }
  }
  const remove = async (id: string) => {
    if (!confirm('Delete this testimony permanently?')) return
    try { await api(`/api/admin/testimonies/${id}`, 'DELETE'); reload() } catch (e) { toast.error((e as Error).message) }
  }
  const rows = (data ?? []).filter((t) => filter === 'ALL' || state(t) === filter)

  return (
    <div>
      <Filter value={filter} onChange={setFilter} options={['PENDING', 'PUBLISHED', 'REJECTED', 'ALL']} counts={data ? { PENDING: data.filter((t) => state(t) === 'PENDING').length } : {}} />
      {!data ? <p className="text-sm text-lm-muted">Loading…</p> : rows.length === 0 ? <p className="text-sm text-lm-muted">Nothing here.</p> : (
        <ul className="space-y-3">
          {rows.map((t) => (
            <li key={t.id} className="panel p-5">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {state(t) === 'PUBLISHED' ? <Badge tone="green">Published</Badge> : state(t) === 'REJECTED' ? <Badge tone="red">Rejected</Badge> : <Badge tone="ember">Pending</Badge>}
                {t.isAnonymous && <Badge tone="gray">Anonymous</Badge>}
                <span className="ml-auto text-xs text-lm-muted dark:text-[#BFAEA3]">{fmtDate(t.createdAt)}</span>
              </div>
              <p className="font-heading text-lg font-bold text-lm-text dark:text-[#FFF4E8]">{t.title ?? <em className="font-normal text-lm-muted dark:text-[#BFAEA3]">Untitled (older testimony)</em>}</p>
              <details className="mt-1">
                <summary className="cursor-pointer text-sm text-lm-muted dark:text-[#BFAEA3]">{t.content.slice(0, 160)}{t.content.length > 160 ? '… (read all)' : ''}</summary>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-lm-text dark:text-[#FFF4E8]">{t.content}</p>
              </details>
              <p className="mt-2 text-xs text-lm-muted dark:text-[#BFAEA3]">
                Shown as: {t.isAnonymous ? 'Anonymous' : t.displayName || t.user?.name || 'Anonymous'}{t.user ? ` · ${t.user.email}` : ' · visitor'}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                {!t.isApproved && <button type="button" onClick={() => act(t.id, 'approve')} className="text-emerald-700 hover:underline dark:text-emerald-400">Approve &amp; publish</button>}
                {state(t) !== 'REJECTED' && <button type="button" onClick={() => act(t.id, 'reject')} className="text-lm-muted hover:underline dark:text-[#BFAEA3]">{t.isApproved ? 'Unpublish' : 'Reject'}</button>}
                {state(t) === 'PUBLISHED' && <Link href={`/testimonies/${t.id}`} className="text-lm-muted hover:underline dark:text-[#BFAEA3]">View</Link>}
                <button type="button" onClick={() => remove(t.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Comments ──────────────────────────────────────────────────────────────
type CommentRow = {
  id: string; content: string; isHidden: boolean; createdAt: string; contentId: string; devotionTitle: string
  user: { name: string | null; email: string }; reports: { reason: string | null; createdAt: string }[]
}

function Comments() {
  const [filter, setFilter] = useState<'reported' | 'recent'>('reported')
  const { data, reload } = useLoad<CommentRow[]>(`/api/admin/comments?filter=${filter}`)
  const moderate = async (id: string, body: { hidden?: boolean; resolve?: true }) => {
    try { await api(`/api/admin/comments/${id}`, 'PATCH', body); toast.success('Updated'); reload() } catch (e) { toast.error((e as Error).message) }
  }
  return (
    <div>
      <div className="mb-5 flex gap-2">
        {(['reported', 'recent'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${filter === f ? 'bg-ember text-white' : 'border border-lm-border text-lm-muted dark:border-ember/20 dark:text-[#BFAEA3]'}`}>
            {f === 'reported' ? 'Reported' : 'All recent'}
          </button>
        ))}
      </div>
      {!data ? <p className="text-sm text-lm-muted">Loading…</p> : data.length === 0 ? <p className="text-sm text-lm-muted">{filter === 'reported' ? 'No open reports.' : 'No comments yet.'}</p> : (
        <ul className="space-y-3">
          {data.map((c) => (
            <li key={c.id} className="panel p-5">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {c.isHidden && <Badge tone="red">Hidden</Badge>}
                {c.reports.length > 0 && <Badge tone="ember">{c.reports.length} report{c.reports.length > 1 ? 's' : ''}</Badge>}
                <Link href={`/devotions/${c.contentId}#discussion`} className="text-xs font-semibold text-ember hover:underline">{c.devotionTitle}</Link>
                <span className="ml-auto text-xs text-lm-muted dark:text-[#BFAEA3]">{fmtDate(c.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-lm-text dark:text-[#FFF4E8]">{c.content}</p>
              <p className="mt-2 text-xs text-lm-muted dark:text-[#BFAEA3]">{c.user.name ?? 'No name'} · {c.user.email}</p>
              {c.reports.some((r) => r.reason) && (
                <ul className="mt-2 list-inside list-disc text-xs text-lm-muted dark:text-[#BFAEA3]">
                  {c.reports.filter((r) => r.reason).map((r, i) => <li key={i}>&ldquo;{r.reason}&rdquo;</li>)}
                </ul>
              )}
              <div className="mt-3 flex gap-3 text-xs font-semibold">
                <button type="button" onClick={() => moderate(c.id, { hidden: !c.isHidden })} className="text-red-600 hover:underline">{c.isHidden ? 'Unhide' : 'Hide comment'}</button>
                {c.reports.length > 0 && <button type="button" onClick={() => moderate(c.id, { resolve: true })} className="text-lm-muted hover:underline dark:text-[#BFAEA3]">Dismiss reports (keep visible)</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Articles ──────────────────────────────────────────────────────────────
type ArticleRow = { id: string; title: string; content: string; category: string; isPublished: boolean; publishedAt: string }
const emptyArticle = { title: '', category: '', content: '', isPublished: true }

function Articles() {
  const { data, reload } = useLoad<ArticleRow[]>('/api/admin/articles')
  const [editing, setEditing] = useState<{ id: string | null; form: typeof emptyArticle } | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    try {
      if (editing.id) await api(`/api/articles/${editing.id}`, 'PATCH', editing.form)
      else await api('/api/articles', 'POST', editing.form)
      toast.success('Article saved')
      setEditing(null)
      reload()
    } catch (err) { toast.error((err as Error).message) }
  }
  const togglePublish = async (a: ArticleRow) => {
    try { await api(`/api/articles/${a.id}`, 'PATCH', { isPublished: !a.isPublished }); reload() } catch (err) { toast.error((err as Error).message) }
  }
  const remove = async (a: ArticleRow) => {
    if (!confirm(`Delete "${a.title}"?`)) return
    try { await api(`/api/articles/${a.id}`, 'DELETE'); reload() } catch (err) { toast.error((err as Error).message) }
  }

  if (editing) {
    const f = editing.form
    return (
      <form onSubmit={save} className="panel max-w-3xl space-y-4 p-6">
        <h2 className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">{editing.id ? 'Edit article' : 'New article'}</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <div><label className="field-label" htmlFor="ar-t">Title</label><input id="ar-t" required className="input" value={f.title} onChange={(e) => setEditing({ ...editing, form: { ...f, title: e.target.value } })} /></div>
          <div><label className="field-label" htmlFor="ar-c">Category</label><input id="ar-c" required className="input" value={f.category} onChange={(e) => setEditing({ ...editing, form: { ...f, category: e.target.value } })} /></div>
        </div>
        <div>
          <label className="field-label" htmlFor="ar-b">Content</label>
          <p className="hint mb-1.5">Use ## for headings and a blank line between paragraphs.</p>
          <textarea id="ar-b" required rows={14} className="input font-mono text-sm" value={f.content} onChange={(e) => setEditing({ ...editing, form: { ...f, content: e.target.value } })} />
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold text-lm-text dark:text-[#FFF4E8]">
          <input type="checkbox" className="check" checked={f.isPublished} onChange={(e) => setEditing({ ...editing, form: { ...f, isPublished: e.target.checked } })} /> Published
        </label>
        <div className="flex gap-3"><button type="submit" className="btn-ember">Save</button><button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancel</button></div>
      </form>
    )
  }

  return (
    <div>
      <div className="mb-5 flex justify-end"><button type="button" onClick={() => setEditing({ id: null, form: emptyArticle })} className="btn-ember !py-2.5 text-xs">+ New article</button></div>
      {!data ? <p className="text-sm text-lm-muted">Loading…</p> : data.length === 0 ? <p className="text-sm text-lm-muted">No articles.</p> : (
        <ul className="divide-y divide-lm-border dark:divide-ember/10">
          {data.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold text-lm-text dark:text-[#FFF4E8]">{a.title} {a.isPublished ? <Badge tone="green">Published</Badge> : <Badge tone="gray">Draft</Badge>}</p>
                <p className="text-xs text-lm-muted dark:text-[#BFAEA3]">{a.category}</p>
              </div>
              <div className="flex gap-3 text-xs font-semibold">
                <button type="button" onClick={() => setEditing({ id: a.id, form: { title: a.title, category: a.category, content: a.content, isPublished: a.isPublished } })} className="text-ember hover:underline">Edit</button>
                <button type="button" onClick={() => togglePublish(a)} className="text-lm-muted hover:underline dark:text-[#BFAEA3]">{a.isPublished ? 'Unpublish' : 'Publish'}</button>
                <button type="button" onClick={() => remove(a)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Filter<T extends string>({ value, onChange, options, counts }: { value: T; onChange: (v: T) => void; options: T[]; counts: Partial<Record<T, number>> }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${value === o ? 'bg-ember text-white' : 'border border-lm-border text-lm-muted dark:border-ember/20 dark:text-[#BFAEA3]'}`}>
          {o.toLowerCase()}{counts[o] ? ` · ${counts[o]}` : ''}
        </button>
      ))}
    </div>
  )
}
