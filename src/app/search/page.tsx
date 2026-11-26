'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react'
import { ModeBadge } from '@/components/ModeBadge'
import type { Feed, FeedItemView } from '@/lib/types'

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<FeedItemView[]>([])
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    fetch('/api/feeds')
      .then((r) => r.json())
      .then((d) => setFeeds(d.feeds || []))
      .catch(() => {})
  }, [])

  const slugById = useMemo(() => Object.fromEntries(feeds.map((f) => [f.id, f.slug])), [feeds])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSearched(true)
    startTransition(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Search failed')
        return
      }
      setResults(data.results || [])
    })
  }

  return (
    <div className="animate-rise space-y-6">
      <div>
        <p className="section-label">Discover</p>
        <h1 className="font-display mt-1 text-4xl text-[var(--ink)]">Search</h1>
        <p className="mt-1 text-[var(--ink-soft)]">Look across all seeded and live feed items.</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          minLength={2}
          required
          placeholder="e.g. Auckland, hiring, SaaS"
          className="input-field min-w-[220px] flex-1"
          aria-label="Search query"
        />
        <button type="submit" disabled={pending} className="btn-ink disabled:opacity-60">
          {pending ? 'Searching…' : 'Search'}
        </button>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <ul className="dense-list divide-y divide-[var(--line)]">
        {results.map((item) => {
          const slug = slugById[item.feedId] || item.feedId
          return (
            <li key={item.id} className="feed-row px-3 py-3.5 sm:px-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/feeds/${slug}/items/${item.articleId}`}
                  className="font-display text-lg text-[var(--ink)] hover:text-[var(--teal)]"
                >
                  {item.article.title}
                </Link>
                <ModeBadge demo={item.article.isDemo} />
              </div>
              <p className="mt-1 text-sm text-[var(--ink-soft)] line-clamp-2">{item.article.summary}</p>
              <p className="section-label mt-2">
                {item.article.sourceTitle} · score {(item.score * 100).toFixed(0)}
              </p>
            </li>
          )
        })}
        {!pending && searched && results.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-[var(--ink-muted)]">No results.</li>
        )}
        {!searched && (
          <li className="px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
            Enter a query to search across feeds.
          </li>
        )}
      </ul>
    </div>
  )
}
