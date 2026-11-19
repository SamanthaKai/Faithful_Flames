import type { Metadata } from 'next'
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { VisitTracker } from '@/components/VisitTracker'
import { JourneyWelcome } from '@/components/JourneyWelcome'
import { DEFAULT_THEME, themeBootScript } from '@/lib/themes'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['italic', 'normal'],
  variable: '--font-scripture',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Faithful Flames',
    template: '%s · Faithful Flames',
  },
  description:
    'Gather around the Word each day. A daily devotion, a place to pray for one another, and testimonies of God’s faithfulness.',
  keywords: ['Christian', 'daily devotion', 'prayer', 'testimonies', 'young believers', 'Bible'],
  icons: { icon: '/favicon.png', apple: '/favicon.png', shortcut: '/favicon.png' },
  openGraph: {
    title: 'Faithful Flames',
    description: 'A digital campfire for young believers.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`} data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <head>
        {/* Apply the saved colour theme and dark mode before the first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <VisitTracker />
          <JourneyWelcome />
          <Toaster
            position="bottom-center"
            containerClassName="on-dark"
            toastOptions={{
              style: { fontFamily: 'var(--font-inter)', borderRadius: '9999px', background: 'rgb(var(--ff-night-bottom))', color: 'rgb(var(--ff-warm))' },
              success: { iconTheme: { primary: 'rgb(var(--ff-ember))', secondary: 'rgb(var(--ff-night-bottom))' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
