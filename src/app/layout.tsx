import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import '@fontsource/fraunces/500.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/700.css'
import '@fontsource/sora/400.css'
import '@fontsource/sora/500.css'
import '@fontsource/sora/600.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Word of Mouth',
  description:
    'Natural-language feed creation — discover sources, ingest, rank, and browse personalised listening posts.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased atmosphere font-body">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 sm:px-6 pb-10 text-xs text-[var(--ink-soft)]">
          Word of Mouth · demo mode needs no credentials · optional AI via env keys
        </footer>
      </body>
    </html>
  )
}
