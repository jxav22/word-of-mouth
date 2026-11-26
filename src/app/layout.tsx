import type { Metadata } from 'next'
import { Fraunces, Sora } from 'next/font/google'
import { AppChrome } from '@/components/AppChrome'
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
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  )
}
