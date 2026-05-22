'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Users } from 'lucide-react'

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  favoriteVerse: string | null
  bio: string | null
  createdAt: string
  role: string
}

interface AccountabilityRequest {
  id: string
  focus: string
  frequency: string
  notes: string | null
  status: 'PENDING' | 'MATCHED'
  partner: { name: string | null; email: string } | null
}

const FOCUS_LABELS: Record<string, string> = {
  BIBLE_READING: 'Bible Reading',
  PRAYER: 'Prayer',
  FASTING: 'Fasting',
  PURITY: 'Purity',
  WORSHIP: 'Worship',
  OTHER: 'Other',
}

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-weekly',
}

const FOCUS_OPTIONS = Object.entries(FOCUS_LABELS)
const FREQUENCY_OPTIONS = Object.entries(FREQUENCY_LABELS)

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', favoriteVerse: '', bio: '', image: '' })
  const [saving, setSaving] = useState(false)

  const [accountability, setAccountability] = useState<AccountabilityRequest | null | 'loading'>('loading')
  const [showAccountabilityForm, setShowAccountabilityForm] = useState(false)
  const [accForm, setAccForm] = useState({ focus: 'PRAYER', frequency: 'WEEKLY', notes: '' })
  const [submittingAcc, setSubmittingAcc] = useState(false)
  const [removingAcc, setRemovingAcc] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then((r) => r.json())
        .then((data) => {
          setProfile(data)
          setForm({ name: data.name ?? '', favoriteVerse: data.favoriteVerse ?? '', bio: data.bio ?? '', image: data.image ?? '' })
        })

      fetch('/api/accountability')
        .then((r) => r.json())
        .then((data) => setAccountability(data))
        .catch(() => setAccountability(null))
    }
  }, [status])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      const data = await res.json()
      setProfile(data)
      await update({ name: data.name, image: data.image })
      toast.success('Profile updated!')
      setEditing(false)
    } else {
      toast.error('Failed to update profile.')
    }
  }

  const handleSubmitAccountability = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingAcc(true)
    const res = await fetch('/api/accountability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accForm),
    })
    setSubmittingAcc(false)
    if (res.ok) {
      const data = await res.json()
      setAccountability(data)
      setShowAccountabilityForm(false)
      toast.success('Request submitted! An admin will match you soon.')
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to submit request.')
    }
  }

  const handleRemoveAccountability = async () => {
    if (!confirm('Withdraw your accountability request?')) return
    setRemovingAcc(true)
    const res = await fetch('/api/accountability', { method: 'DELETE' })
    setRemovingAcc(false)
    if (res.ok) {
      setAccountability(null)
      toast.success('Request withdrawn.')
    } else {
      toast.error('Failed to withdraw request.')
    }
  }

  if (!profile) return null

  const initial = (profile.name?.[0] ?? profile.email[0]).toUpperCase()
  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="section-title text-3xl mb-8">My Profile</h1>

      <div className="card p-6 md:p-8 mb-6">
        {/* Avatar + basics */}
        <div className="flex items-start gap-5 mb-6">
          <div className="flex-shrink-0">
            {profile.image ? (
              <Image src={profile.image} alt={profile.name ?? ''} width={64} height={64} className="rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                {initial}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream">{profile.name ?? 'Community Member'}</h2>
            <p className="text-warm-gray text-sm">{profile.email}</p>
            <p className="text-xs text-warm-gray mt-1">Member since {memberSince}</p>
            {profile.role === 'ADMIN' && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">Admin</span>
            )}
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-outline py-1.5 px-4 text-xs">Edit</button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Profile picture URL</label>
              <input value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} className="input" placeholder="https://..." type="url" />
              {form.image && (
                <div className="mt-2 flex items-center gap-3">
                  <Image src={form.image} alt="Preview" width={40} height={40} className="rounded-full object-cover" onError={() => setForm((p) => ({ ...p, image: '' }))} />
                  <span className="text-xs text-warm-gray">Preview</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Favourite Verse</label>
              <input value={form.favoriteVerse} onChange={(e) => setForm((p) => ({ ...p, favoriteVerse: e.target.value }))} className="input" placeholder="e.g. John 3:16" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={3} className="input resize-none" placeholder="A little about you..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save changes'}</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 border-t border-gray-100 dark:border-[#3A3030] pt-5">
            {profile.bio && (
              <div>
                <p className="text-xs font-semibold text-warm-gray uppercase tracking-wide mb-1">Bio</p>
                <p className="text-charcoal dark:text-cream text-sm leading-relaxed">{profile.bio}</p>
              </div>
            )}
            {profile.favoriteVerse && (
              <div>
                <p className="text-xs font-semibold text-warm-gray uppercase tracking-wide mb-1">Favourite Verse</p>
                <p className="text-primary font-semibold text-sm italic">{profile.favoriteVerse}</p>
              </div>
            )}
            {!profile.bio && !profile.favoriteVerse && (
              <p className="text-warm-gray text-sm">Add a bio and favourite verse to personalise your profile.</p>
            )}
          </div>
        )}
      </div>

      {/* Accountability Partner */}
      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <Users size={20} className="text-primary flex-shrink-0" />
          <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream">Accountability Partner</h2>
        </div>

        {accountability === 'loading' ? (
          <div className="skeleton h-16 rounded" />
        ) : accountability?.status === 'MATCHED' ? (
          <div className="space-y-3">
            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4">
              <p className="text-xs font-semibold text-warm-gray uppercase tracking-wide mb-1">Your partner</p>
              <p className="font-semibold text-charcoal dark:text-cream">{accountability.partner?.name ?? 'Community Member'}</p>
              <p className="text-xs text-warm-gray mt-0.5">{accountability.partner?.email}</p>
            </div>
            <div className="flex gap-4 text-sm text-warm-gray">
              <span><strong className="text-charcoal dark:text-cream">Focus:</strong> {FOCUS_LABELS[accountability.focus] ?? accountability.focus}</span>
              <span><strong className="text-charcoal dark:text-cream">Check-ins:</strong> {FREQUENCY_LABELS[accountability.frequency] ?? accountability.frequency}</span>
            </div>
            {accountability.notes && (
              <p className="text-sm text-charcoal dark:text-cream/80 italic">{accountability.notes}</p>
            )}
          </div>
        ) : accountability?.status === 'PENDING' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-warm-gray">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Your request is pending. An admin will match you soon.
            </div>
            <div className="flex gap-4 text-sm text-warm-gray">
              <span><strong className="text-charcoal dark:text-cream">Focus:</strong> {FOCUS_LABELS[accountability.focus] ?? accountability.focus}</span>
              <span><strong className="text-charcoal dark:text-cream">Check-ins:</strong> {FREQUENCY_LABELS[accountability.frequency] ?? accountability.frequency}</span>
            </div>
            <button
              type="button"
              onClick={handleRemoveAccountability}
              disabled={removingAcc}
              className="text-xs text-warm-gray hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {removingAcc ? 'Withdrawing...' : 'Withdraw request'}
            </button>
          </div>
        ) : showAccountabilityForm ? (
          <form onSubmit={handleSubmitAccountability} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">What area do you want accountability in?</label>
              <select
                value={accForm.focus}
                onChange={(e) => setAccForm((p) => ({ ...p, focus: e.target.value }))}
                className="input"
                aria-label="Focus area"
              >
                {FOCUS_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">How often do you want to check in?</label>
              <select
                value={accForm.frequency}
                onChange={(e) => setAccForm((p) => ({ ...p, frequency: e.target.value }))}
                className="input"
                aria-label="Check-in frequency"
              >
                {FREQUENCY_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Anything else you want a partner to know? (optional)</label>
              <textarea
                value={accForm.notes}
                onChange={(e) => setAccForm((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                placeholder="Share your goals, struggles, or preferences..."
                aria-label="Additional notes"
                className="input resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submittingAcc} className="btn-primary">
                {submittingAcc ? 'Submitting...' : 'Submit request'}
              </button>
              <button type="button" onClick={() => setShowAccountabilityForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-warm-gray">
              Grow stronger with a fellow believer by your side. Sign up to be matched with an accountability partner.
            </p>
            <button
              type="button"
              onClick={() => setShowAccountabilityForm(true)}
              className="btn-primary"
            >
              Find a partner
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
