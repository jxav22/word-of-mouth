'use client'

import Link from 'next/link'
import { FormEvent, useState, useTransition } from 'react'
import type { FeedItemView } from '@/lib/types'

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<FeedItemView[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-[var(--ink)]">Search</h1>
        <p className="text-[var(--ink-soft)] mt-1">Look across all seeded and live feed items.</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          minLength={2}
          required
          placeholder="e.g. Auckland, hiring, SaaS"
          className="flex-1 min-w-[220px] bg-white/70 border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--moss)]"
        />
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-[var(--ink)] text-[var(--paper)] disabled:opacity-60"
        >
          {pending ? 'Searching…' : 'Search'}
        </button>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <ul className="divide-y divide-[var(--line)] border border-[var(--line)] bg-white/35">
        {results.map((item) => (
          <li key={item.id} className="px-4 py-3">
            <Link
              href={`/feeds/${item.feedId}/items/${item.articleId}`}
              className="font-display text-lg hover:text-[var(--moss)]"
            >
              {item.article.title}
            </Link>
            <p className="text-sm text-[var(--ink-soft)] line-clamp-2">{item.article.summary}</p>
            <p className="text-xs text-[var(--ink-soft)] mt-1">
              {item.article.sourceTitle} · score {(item.score * 100).toFixed(0)}
              {item.article.isDemo ? ' · demo' : ''}
            </p>
          </li>
        ))}
        {!pending && results.length === 0 && (
          <li className="px-4 py-8 text-sm text-[var(--ink-soft)]">No results yet.</li>
        )}
      </ul>
    </div>
  )
}
