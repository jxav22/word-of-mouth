import type { Metadata } from 'next'
import { AppChrome } from '@/components/AppChrome'
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
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  )
}
