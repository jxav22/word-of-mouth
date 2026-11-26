'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState, useTransition } from 'react'

export function CreateFeedForm() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setStatus('Parsing query, discovering sources, ingesting…')
    startTransition(async () => {
      try {
        const res = await fetch('/api/feeds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, title: title || undefined }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Create failed')
        const ingestNote =
          data.ingest?.errors?.length > 0
            ? ` Created with ${data.ingest.errors.length} source warning(s).`
            : ''
        setStatus(`Feed ready.${ingestNote}`)
        router.push(`/feeds/${data.feed.slug}`)
        router.refresh()
      } catch (err) {
        setStatus(null)
        setError(err instanceof Error ? err.message : 'Create failed')
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="panel p-5 sm:p-6 space-y-4 animate-rise-delay" id="create">
      <div className="space-y-1">
        <label htmlFor="query" className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          What should we listen for?
        </label>
        <textarea
          id="query"
          required
          minLength={3}
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Remote TypeScript jobs in New Zealand and APAC startups hiring platform engineers"
          className="w-full resize-y bg-white/70 border border-[var(--line)] px-3 py-2.5 text-[var(--ink)] outline-none focus:border-[var(--moss)] focus:ring-2 focus:ring-[var(--glow)]"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="title" className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          Optional title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Leave blank to derive from your query"
          className="w-full bg-white/70 border border-[var(--line)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--moss)]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="cta-pulse px-4 py-2.5 bg-[var(--amber)] text-[var(--ink)] font-medium hover:bg-[var(--amber-deep)] hover:text-white disabled:opacity-60 transition-colors"
        >
          {pending ? 'Building feed…' : 'Create feed'}
        </button>
        <p className="text-xs text-[var(--ink-soft)] max-w-sm">
          Credential-free. Uses public RSS/HN. AI summaries only if you set API keys.
        </p>
      </div>
      {status && <p className="text-sm text-[var(--moss)]">{status}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  )
}
