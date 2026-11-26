'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState, useTransition } from 'react'
import { SourceWarningsBanner } from './SourceWarningsBanner'

const EXAMPLES = [
  'Remote TypeScript jobs in New Zealand and APAC',
  'AI tooling and developer platform news',
  'Auckland tech meetups and local events',
]

type IngestWarning = { title: string; kind?: string; message: string }

export function CreateFeedForm() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [title, setTitle] = useState('')
  const [showTitle, setShowTitle] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<IngestWarning[]>([])
  const [pending, startTransition] = useTransition()

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setWarnings([])
    setStatus('Parsing query · discovering sources · ingesting…')
    startTransition(async () => {
      try {
        const res = await fetch('/api/feeds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, title: title || undefined }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Create failed')

        const rawErrors: string[] = data.ingest?.errors || []
        const nextWarnings: IngestWarning[] = rawErrors.map((message) => {
          const kindMatch = message.match(/\b(rss|hn|reddit|api|demo)\b/i)
          return {
            title: 'Source ingest',
            kind: kindMatch?.[1]?.toLowerCase(),
            message,
          }
        })
        setWarnings(nextWarnings)

        const ingested = data.ingest?.ingested ?? 0
        const ranked = data.ingest?.ranked ?? 0
        if (nextWarnings.length > 0) {
          setStatus(
            `Feed ready · ingested ${ingested}, ranked ${ranked} · ${nextWarnings.length} source warning(s). Opening feed…`,
          )
        } else {
          setStatus(`Feed ready · ingested ${ingested}, ranked ${ranked}. Opening…`)
        }

        const slug = data.feed.slug as string
        const qs = nextWarnings.length > 0 ? '?created=1&warnings=1' : '?created=1'
        // Brief beat so the warning callout is readable before navigation
        await new Promise((r) => setTimeout(r, nextWarnings.length > 0 ? 900 : 250))
        router.push(`/feeds/${slug}${qs}`)
        router.refresh()
      } catch (err) {
        setStatus(null)
        setWarnings([])
        setError(err instanceof Error ? err.message : 'Create failed')
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="composer animate-rise-delay space-y-5 p-5 sm:p-7" id="create">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label">Create a listening post</p>
          <h2 className="font-display mt-1 text-2xl text-[var(--ink)] sm:text-3xl">
            What should we listen for?
          </h2>
        </div>
        <span className="badge badge-live">
          <span className="badge-dot" aria-hidden />
          Live ingest
        </span>
      </div>

      <div className="space-y-2">
        <label htmlFor="query" className="sr-only">
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
          className="input-field resize-y text-base leading-relaxed"
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              className="text-left text-xs text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--teal)] hover:underline"
              onClick={() => setQuery(ex)}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {showTitle ? (
        <div className="space-y-1 animate-rise">
          <label htmlFor="title" className="section-label">
            Optional title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Leave blank to derive from your query"
            className="input-field"
          />
        </div>
      ) : (
        <button
          type="button"
          className="text-xs text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--teal)] hover:underline"
          onClick={() => setShowTitle(true)}
        >
          + Add a custom title
        </button>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4">
        <button type="submit" disabled={pending} className="btn-primary cta-pulse">
          {pending ? 'Building feed…' : 'Create feed'}
        </button>
        <p className="max-w-sm text-xs text-[var(--ink-muted)]">
          No credentials required. Public RSS / HN. AI summaries only if API keys are set.
        </p>
      </div>
      {status && <p className="text-sm text-[var(--teal)]">{status}</p>}
      {warnings.length > 0 && <SourceWarningsBanner warnings={warnings} justCreated />}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  )
}
