'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { FeedItemView } from '@/lib/types'

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
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter this feed…"
        className="w-full sm:max-w-md bg-white/70 border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--moss)]"
      />
      <ul className="divide-y divide-[var(--line)] border border-[var(--line)] bg-white/35">
        {filtered.map((item) => (
          <li key={item.id} className="feed-row px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/feeds/${feedSlug}/items/${item.articleId}`}
                    className="font-display text-lg text-[var(--ink)] hover:text-[var(--moss)]"
                  >
                    {item.article.title}
                  </Link>
                  {item.article.isDemo && <span className="badge badge-demo">Demo item</span>}
                </div>
                <p className="text-sm text-[var(--ink-soft)] line-clamp-2">{item.article.summary}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem] uppercase tracking-[0.1em] text-[var(--ink-soft)]/80">
                  <span>{item.article.sourceTitle}</span>
                  <span>score {(item.score * 100).toFixed(0)}</span>
                  <span>{item.reasons.slice(0, 3).join(' · ')}</span>
                </div>
                <div className="score-bar mt-2 max-w-xs">
                  <span style={{ width: `${Math.round(item.score * 100)}%` }} />
                </div>
              </div>
              <a
                href={item.article.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--moss)] whitespace-nowrap"
              >
                Source ↗
              </a>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-4 py-8 text-sm text-[var(--ink-soft)]">No items match.</li>
        )}
      </ul>
    </div>
  )
}
