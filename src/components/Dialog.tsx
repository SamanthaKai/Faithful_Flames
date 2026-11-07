'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// Centred, on-brand replacement for window.confirm / window.prompt.
//   const dialog = useDialog()
//   if (await dialog.confirm({ title: 'Delete?', message: '…', confirmLabel: 'Delete', danger: true })) …
//   const reason = await dialog.prompt({ title: 'Report', label: 'Reason (optional)' })  // null = cancelled

type ConfirmOptions = {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}
type PromptOptions = ConfirmOptions & { label?: string; placeholder?: string; maxLength?: number }

type Request =
  | { kind: 'confirm'; opts: ConfirmOptions; resolve: (v: boolean) => void }
  | { kind: 'prompt'; opts: PromptOptions; resolve: (v: string | null) => void }

const DialogContext = createContext<{
  confirm: (o: ConfirmOptions) => Promise<boolean>
  prompt: (o: PromptOptions) => Promise<string | null>
} | null>(null)

export function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be used inside <DialogProvider>')
  return ctx
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [req, setReq] = useState<Request | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => new Promise<boolean>((resolve) => setReq({ kind: 'confirm', opts, resolve })), [])
  const prompt = useCallback((opts: PromptOptions) => new Promise<string | null>((resolve) => setReq({ kind: 'prompt', opts, resolve })), [])

  const close = (value: boolean | string | null) => {
    if (!req) return
    if (req.kind === 'confirm') req.resolve(value === true || typeof value === 'string')
    else req.resolve(typeof value === 'string' ? value : null)
    setReq(null)
  }

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}
      {req && <DialogBox req={req} onClose={close} />}
    </DialogContext.Provider>
  )
}

function DialogBox({ req, onClose }: { req: Request; onClose: (v: boolean | string | null) => void }) {
  const { opts } = req
  const [value, setValue] = useState('')
  const confirmRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const onClose = (v: boolean | string | null) => onCloseRef.current(v)
    const previous = document.activeElement as HTMLElement | null
    ;(req.kind === 'prompt' ? inputRef.current : confirmRef.current)?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(null)
      if (e.key === 'Tab' && panelRef.current) {
        // keep keyboard focus inside the dialog
        const els = panelRef.current.querySelectorAll<HTMLElement>('button, textarea')
        const first = els[0], last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previous?.focus?.()
    }
  }, [req])

  const submit = () => onClose(req.kind === 'prompt' ? value.trim() : true)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" role="presentation">
      <div className="absolute inset-0 bg-[#0D0A0A]/60 backdrop-blur-sm" onClick={() => onClose(null)} aria-hidden="true" />
      <div
        ref={panelRef}
        role={req.kind === 'confirm' && opts.danger ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="dlg-title"
        aria-describedby={opts.message ? 'dlg-msg' : undefined}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-lm-border bg-lm-card shadow-2xl animate-slide-up dark:border-ember/15 dark:bg-[#161111]"
      >
        <div className={`h-1 w-full ${opts.danger ? 'bg-red-500' : 'bg-gradient-to-r from-ember-deep via-ember to-gold'}`} />
        <form
          className="p-6 sm:p-7"
          onSubmit={(e) => { e.preventDefault(); submit() }}
        >
          <h2 id="dlg-title" className="font-heading text-xl font-bold text-lm-text dark:text-[#FFF4E8]">{opts.title}</h2>
          {opts.message && (
            <p id="dlg-msg" className="mt-2 text-sm leading-relaxed text-lm-muted dark:text-[#BFAEA3]">{opts.message}</p>
          )}
          {req.kind === 'prompt' && (
            <div className="mt-4">
              {req.opts.label && <label htmlFor="dlg-input" className="field-label">{req.opts.label}</label>}
              <textarea
                id="dlg-input"
                ref={inputRef}
                rows={3}
                value={value}
                maxLength={req.opts.maxLength ?? 300}
                placeholder={req.opts.placeholder}
                onChange={(e) => setValue(e.target.value)}
                className="input resize-none"
              />
            </div>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => onClose(null)} className="btn-ghost">
              {opts.cancelLabel ?? 'Cancel'}
            </button>
            <button
              ref={confirmRef}
              type="submit"
              className={opts.danger
                ? 'inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2'
                : 'btn-ember !py-2.5'}
            >
              {opts.confirmLabel ?? 'OK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
