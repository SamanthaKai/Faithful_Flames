'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

export function AccountSettings({ name, email }: { name: string; email: string }) {
  const { update } = useSession()
  const [value, setValue] = useState(name)
  const [busy, setBusy] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: value }) })
    setBusy(false)
    const d = await res.json().catch(() => ({}))
    if (!res.ok) return toast.error(d.error ?? 'Could not save.')
    await update({ name: d.name })
    toast.success('Display name updated')
  }

  const remove = async () => {
    if (!confirm('Delete your account? Your notes, bookmarks and comments will be removed. This cannot be undone.')) return
    const res = await fetch('/api/profile', { method: 'DELETE' })
    if (!res.ok) return toast.error('Could not delete your account.')
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="mt-5 space-y-8">
      <form onSubmit={save} className="max-w-md">
        <label htmlFor="dn" className="field-label">Display name</label>
        <p className="hint mb-2">Shown next to your comments in the daily conversation.</p>
        <div className="flex gap-2">
          <input id="dn" value={value} onChange={(e) => setValue(e.target.value)} minLength={2} maxLength={40} required className="input" />
          <button type="submit" disabled={busy || value.trim() === name} className="btn-ghost shrink-0">Save</button>
        </div>
        <p className="hint mt-3">Signed in as {email}</p>
      </form>
      <div>
        <button type="button" onClick={remove} className="text-sm font-semibold text-red-600 hover:underline dark:text-red-400">Delete my account</button>
      </div>
    </div>
  )
}
