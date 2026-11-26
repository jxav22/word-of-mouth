'use client'

import { usePathname } from 'next/navigation'
import { SiteHeader } from './SiteHeader'

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <>
      {!isHome && <SiteHeader />}
      {isHome ? (
        <main>{children}</main>
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      )}
      <footer
        className={`mx-auto max-w-6xl px-4 pb-10 text-xs text-[var(--ink-muted)] sm:px-6 ${
          isHome ? '' : ''
        }`}
      >
        Word of Mouth · demo mode needs no credentials · optional AI via env keys
      </footer>
    </>
  )
}
