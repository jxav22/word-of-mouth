'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type FeedOption = { id: string; title: string }

const KINDS = ['rss', 'hn', 'reddit', 'api'] as const

export function SourceManager({ feeds }: { feeds: FeedOption[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [feedId, setFeedId] = useState(feeds[0]?.id || '')
  const [kind, setKind] = useState<(typeof KINDS)[number]>('rss')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedId, kind, url, title: title || undefined }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to add source')
        setUrl('')
        setTitle('')
        setMessage(`Added ${data.source.title}`)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed')
      }
    })
  }

  if (feeds.length === 0) return null

  return (
    <form onSubmit={onSubmit} className="border border-[var(--line)] bg-white/50 p-4 space-y-3">
      <h2 className="font-display text-2xl text-[var(--ink)]">Add source</h2>
      <p className="text-sm text-[var(--ink-soft)]">
        Attach an RSS feed, HN Algolia query, Reddit listing, or public JSON API.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm space-y-1">
          <span className="text-[var(--ink-soft)]">Feed</span>
          <select
            className="w-full border border-[var(--line)] bg-white px-2 py-2"
            value={feedId}
            onChange={(e) => setFeedId(e.target.value)}
          >
            {feeds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm space-y-1">
          <span className="text-[var(--ink-soft)]">Kind</span>
          <select
            className="w-full border border-[var(--line)] bg-white px-2 py-2"
            value={kind}
            onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm space-y-1 sm:col-span-2">
          <span className="text-[var(--ink-soft)]">URL</span>
          <input
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="w-full border border-[var(--line)] bg-white px-2 py-2"
          />
        </label>
        <label className="text-sm space-y-1 sm:col-span-2">
          <span className="text-[var(--ink-soft)]">Title (optional)</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-[var(--line)] bg-white px-2 py-2"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending || !feedId}
        className="px-4 py-2 bg-[var(--ink)] text-white text-sm disabled:opacity-50"
      >
        {pending ? 'Adding…' : 'Add & ingest'}
      </button>
      {message && <p className="text-sm text-emerald-800">{message}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  )
}
