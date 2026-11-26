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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-[var(--ink)]">Source diagnostics</h1>
        <p className="text-[var(--ink-soft)] mt-1">
          {summary.ok} ok · {summary.error} error · {summary.pending} pending · {summary.total} total
        </p>
      </div>
      <div className="overflow-x-auto border border-[var(--line)] bg-white/40">
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)] border-b border-[var(--line)]">
            <tr>
              <th className="px-3 py-2">Feed</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Kind</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Last fetch</th>
              <th className="px-3 py-2">Error</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-b border-[var(--line)] align-top">
                <td className="px-3 py-2">{feeds[s.feedId]?.title || s.feedId}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-[var(--ink-soft)] break-all max-w-md">{s.url}</div>
                </td>
                <td className="px-3 py-2">{s.kind}</td>
                <td className="px-3 py-2">
                  <span className={`badge ${s.status === 'ok' ? 'badge-live' : s.status === 'error' ? 'badge-demo' : ''}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {s.lastFetchedAt
                    ? new Date(s.lastFetchedAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })
                    : '—'}
                </td>
                <td className="px-3 py-2 text-red-700 max-w-xs">{s.lastError || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
