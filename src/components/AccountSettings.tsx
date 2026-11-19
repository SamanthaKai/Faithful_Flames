'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { useDialog } from './Dialog'

export function AccountSettings({ name, email, hasPassword = true }: { name: string; email: string; hasPassword?: boolean }) {
  const { update } = useSession()
  const dialog = useDialog()
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
    const message = 'Your notes, bookmarks and comments will be removed. This cannot be undone.'
    // Asking for the password means a borrowed or unattended phone can't delete the account.
    const password = hasPassword
      ? await dialog.prompt({ title: 'Delete your account?', message, label: 'Enter your password to confirm', secret: true, maxLength: 72, confirmLabel: 'Delete my account', danger: true })
      : (await dialog.confirm({ title: 'Delete your account?', message, confirmLabel: 'Delete my account', danger: true })) ? '' : null
    if (password === null) return
    if (hasPassword && !password) return toast.error('Please enter your password.')
    const res = await fetch('/api/profile', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    const d = await res.json().catch(() => ({}))
    if (!res.ok) return toast.error(d.error ?? 'Could not delete your account.')
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
