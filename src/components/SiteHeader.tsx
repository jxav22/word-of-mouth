import Link from 'next/link'
import { BrandMark } from './BrandMark'

export function SiteHeader({ overHero = false }: { overHero?: boolean }) {
  return (
    <header
      className={
        overHero
          ? 'site-header-over-hero'
          : 'site-header sticky top-0 z-40'
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <BrandMark inverted={overHero} />
        <nav className="flex items-center gap-3 text-sm sm:gap-4">
          <Link
            className={`nav-link transition-colors hover:text-[var(--teal)] ${overHero ? '' : 'text-[var(--ink-soft)]'}`}
            href="/feeds"
          >
            Feeds
          </Link>
          <Link
            className={`nav-link hidden sm:inline transition-colors hover:text-[var(--teal)] ${overHero ? '' : 'text-[var(--ink-soft)]'}`}
            href="/sources"
          >
            Sources
          </Link>
          <Link
            className={`nav-link transition-colors hover:text-[var(--teal)] ${overHero ? '' : 'text-[var(--ink-soft)]'}`}
            href="/search"
          >
            Search
          </Link>
          <Link
            className={
              overHero
                ? 'nav-cta hidden sm:inline-flex px-3 py-1.5 transition-colors'
                : 'hidden sm:inline-flex px-3 py-1.5 bg-[var(--ink)] text-[var(--paper)] transition-colors hover:bg-[var(--teal)]'
            }
            href="/#create"
          >
            New feed
          </Link>
        </nav>
      </div>
    </header>
  )
}
