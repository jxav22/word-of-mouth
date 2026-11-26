import { ModeBadge } from '@/components/ModeBadge'
import { bootstrap } from '@/lib/bootstrap'
import { listFeeds, listSources } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

export default async function SourcesPage() {
  await bootstrap()
  const sources = listSources()
  const feeds = Object.fromEntries(listFeeds().map((f) => [f.id, f]))
  const summary = {
    total: sources.length,
    ok: sources.filter((s) => s.status === 'ok').length,
    error: sources.filter((s) => s.status === 'error').length,
    pending: sources.filter((s) => s.status === 'pending').length,
  }

  return (
    <div className="animate-rise space-y-6">
      <div>
        <p className="section-label">Diagnostics</p>
        <h1 className="font-display mt-1 text-4xl text-[var(--ink)]">Sources</h1>
        <p className="mt-1 text-[var(--ink-soft)]">
          <span className="status-ok">{summary.ok} ok</span>
          {' · '}
          <span className="status-error">{summary.error} error</span>
          {' · '}
          <span className="status-pending">{summary.pending} pending</span>
          {' · '}
          {summary.total} total
        </p>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="space-y-3 md:hidden">
        {sources.map((s) => {
          const feed = feeds[s.feedId]
          return (
            <li key={s.id} className="border border-[var(--line)] bg-white/40 p-3 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-[var(--ink)]">{s.title}</span>
                <span
                  className={`badge ${s.status === 'ok' ? 'badge-live' : s.status === 'error' ? 'badge-demo' : ''}`}
                >
                  {s.status}
                </span>
              </div>
              <p className="text-sm text-[var(--ink-soft)]">{feed?.title || s.feedId}</p>
              {feed && <ModeBadge demo={feed.isDemo} />}
              <p className="section-label">
                {s.kind}
                {s.lastFetchedAt
                  ? ` · ${new Date(s.lastFetchedAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })} NZDT`
                  : ''}
              </p>
              <p className="break-all text-xs text-[var(--ink-muted)]">{s.url}</p>
              {s.lastError && <p className="text-xs text-red-700">{s.lastError}</p>}
            </li>
          )
        })}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto border border-[var(--line)] bg-white/40 md:block">
        <table className="min-w-full text-sm">
          <thead className="border-b border-[var(--line)] text-left">
            <tr className="section-label">
              <th className="px-3 py-2.5 font-normal">Feed</th>
              <th className="px-3 py-2.5 font-normal">Source</th>
              <th className="px-3 py-2.5 font-normal">Kind</th>
              <th className="px-3 py-2.5 font-normal">Status</th>
              <th className="px-3 py-2.5 font-normal">Last fetch</th>
              <th className="px-3 py-2.5 font-normal">Error</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => {
              const feed = feeds[s.feedId]
              return (
                <tr key={s.id} className="border-b border-[var(--line)] align-top">
                  <td className="px-3 py-2.5">
                    <div>{feed?.title || s.feedId}</div>
                    {feed && (
                      <div className="mt-1">
                        <ModeBadge demo={feed.isDemo} />
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{s.title}</div>
                    <div className="max-w-md break-all text-xs text-[var(--ink-muted)]">{s.url}</div>
                  </td>
                  <td className="px-3 py-2.5">{s.kind}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`badge ${s.status === 'ok' ? 'badge-live' : s.status === 'error' ? 'badge-demo' : ''}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[var(--ink-muted)]">
                    {s.lastFetchedAt
                      ? new Date(s.lastFetchedAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })
                      : '—'}
                  </td>
                  <td className="max-w-xs px-3 py-2.5 text-red-700">{s.lastError || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
