import type { Metadata } from 'next'
import { Fraunces, Sora } from 'next/font/google'
import { SiteHeader } from '@/components/SiteHeader'
import './globals.css'

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
})

const body = Sora({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Word of Mouth',
  description:
    'Natural-language feed creation — discover sources, ingest, rank, and browse personalised listening posts.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased atmosphere`}>
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 sm:px-6 pb-10 text-xs text-[var(--ink-soft)]">
          Word of Mouth · demo mode needs no credentials · optional AI via env keys
        </footer>
      </body>
    </html>
  )
}
