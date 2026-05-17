'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

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

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', favoriteVerse: '', bio: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then((r) => r.json())
        .then((data) => {
          setProfile(data)
          setForm({ name: data.name ?? '', favoriteVerse: data.favoriteVerse ?? '', bio: data.bio ?? '' })
        })
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
      await update({ name: data.name })
      toast.success('Profile updated!')
      setEditing(false)
    } else {
      toast.error('Failed to update profile.')
    }
  }


  if (!profile) return null

  const initial = (profile.name?.[0] ?? profile.email[0]).toUpperCase()
  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="section-title text-3xl mb-8">My Profile</h1>

      <div className="card p-6 md:p-8">
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
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Favourite Verse</label>
              <input value={form.favoriteVerse} onChange={(e) => setForm((p) => ({ ...p, favoriteVerse: e.target.value }))} className="input" placeholder="e.g. John 3:16" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-cream mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={3} className="input resize-none" placeholder="A little about you..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save changes'}</button>
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

    </div>
  )
}
