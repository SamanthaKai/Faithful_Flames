'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from './ThemeProvider'
import { DialogProvider } from './Dialog'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <DialogProvider>{children}</DialogProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
