import Link from 'next/link'
import type { Feed } from '@/lib/types'
import { ModeBadge } from './ModeBadge'

export function FeedList({ feeds }: { feeds: Feed[] }) {
  if (feeds.length === 0) {
    return (
      <p className="border border-dashed border-[var(--line)] px-4 py-10 text-center text-[var(--ink-soft)]">
        No feeds yet. Create one above.
      </p>
    )
  }

  return (
    <ul className="dense-list divide-y divide-[var(--line)]">
      {feeds.map((feed, idx) => (
        <li
          key={feed.id}
          className="feed-row animate-rise"
          style={{ animationDelay: `${idx * 45}ms` }}
        >
          <Link href={`/feeds/${feed.slug}`} className="block px-3 py-3.5 no-underline text-inherit sm:px-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg text-[var(--ink)] sm:text-xl">{feed.title}</h3>
                  <ModeBadge demo={feed.isDemo} />
                </div>
                <p className="text-sm leading-snug text-[var(--ink-soft)] line-clamp-2">{feed.query}</p>
                <p className="section-label pt-1">
                  {feed.topics.join(' · ') || 'general'}
                  {feed.keywords.length > 0 ? ` · ${feed.keywords.slice(0, 4).join(', ')}` : ''}
                </p>
              </div>
              <span className="mt-1 shrink-0 text-xs text-[var(--ink-muted)]">Open →</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
