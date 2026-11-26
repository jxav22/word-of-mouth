import Link from 'next/link'
import { BrandMark } from './BrandMark'

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-[rgba(243,247,244,0.65)] backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <BrandMark />
        <nav className="flex items-center gap-4 text-sm text-[var(--ink-soft)]">
          <Link className="hover:text-[var(--moss)] transition-colors" href="/feeds">
            Feeds
          </Link>
          <Link className="hover:text-[var(--moss)] transition-colors" href="/sources">
            Sources
          </Link>
          <Link className="hover:text-[var(--moss)] transition-colors" href="/search">
            Search
          </Link>
          <Link
            className="hidden sm:inline-flex px-3 py-1.5 bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--moss)] transition-colors"
            href="/#create"
          >
            New feed
          </Link>
        </nav>
      </div>
    </header>
  )
}
