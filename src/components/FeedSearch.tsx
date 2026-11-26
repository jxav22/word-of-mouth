'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { FeedItemView } from '@/lib/types'
import { ModeBadge } from './ModeBadge'

export function FeedSearch({
  feedSlug,
  items,
}: {
  feedSlug: string
  items: FeedItemView[]
}) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return items
    return items.filter(
      (i) =>
        i.article.title.toLowerCase().includes(needle) ||
        i.article.summary.toLowerCase().includes(needle) ||
        i.article.sourceTitle.toLowerCase().includes(needle),
    )
  }, [items, q])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter this feed…"
          className="input-field sm:max-w-md"
          aria-label="Filter feed items"
        />
        <p className="section-label">
          {filtered.length} of {items.length}
        </p>
      </div>
      <ul className="dense-list divide-y divide-[var(--line)]">
        {filtered.map((item) => (
          <li key={item.id} className="feed-row px-3 py-3.5 sm:px-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/feeds/${feedSlug}/items/${item.articleId}`}
                    className="font-display text-base text-[var(--ink)] hover:text-[var(--teal)] sm:text-lg"
                  >
                    {item.article.title}
                  </Link>
                  {item.article.isDemo && <ModeBadge demo />}
                </div>
                <p className="text-sm leading-snug text-[var(--ink-soft)] line-clamp-2">
                  {item.article.summary}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem] uppercase tracking-[0.1em] text-[var(--ink-muted)]">
                  <span>{item.article.sourceTitle}</span>
                  <span>score {(item.score * 100).toFixed(0)}</span>
                  {item.reasons.slice(0, 2).map((r) => (
                    <span key={r}>{r}</span>
                  ))}
                </div>
                <div className="score-bar mt-1.5 max-w-xs">
                  <span style={{ width: `${Math.round(item.score * 100)}%` }} />
                </div>
              </div>
              <a
                href={item.article.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs text-[var(--teal)] whitespace-nowrap"
              >
                Source ↗
              </a>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-[var(--ink-muted)]">No items match.</li>
        )}
      </ul>
    </div>
  )
}
