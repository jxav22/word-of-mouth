import Link from 'next/link'
import type { Feed } from '@/lib/types'

export function FeedList({ feeds }: { feeds: Feed[] }) {
  if (feeds.length === 0) {
    return <p className="text-[var(--ink-soft)]">No feeds yet. Create one above.</p>
  }

  return (
    <ul className="divide-y divide-[var(--line)] border border-[var(--line)] bg-white/40">
      {feeds.map((feed, idx) => (
        <li key={feed.id} className="feed-row" style={{ animationDelay: `${idx * 40}ms` }}>
          <Link href={`/feeds/${feed.slug}`} className="block px-4 py-3.5 no-underline text-inherit">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-display text-xl text-[var(--ink)] truncate">{feed.title}</h3>
                  <span className={`badge ${feed.isDemo ? 'badge-demo' : 'badge-live'}`}>
                    {feed.isDemo ? 'Demo' : 'Live'}
                  </span>
                </div>
                <p className="text-sm text-[var(--ink-soft)] line-clamp-2">{feed.query}</p>
                <p className="mt-2 text-[0.7rem] uppercase tracking-[0.12em] text-[var(--ink-soft)]/80">
                  {feed.topics.join(' · ') || 'general'} · {feed.keywords.slice(0, 4).join(', ')}
                </p>
              </div>
              <span className="text-xs text-[var(--ink-soft)] whitespace-nowrap">Open →</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
