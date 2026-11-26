import { bootstrap } from '@/lib/bootstrap'
import { listFeeds, listSources } from '@/lib/feeds/service'
import { listAdapters } from '@/lib/sources/registry'
import { getSchedulerStatus, listIngestRuns } from '@/lib/ingest/diagnostics'
import { SourceManager } from '@/components/SourceManager'
import { SourceActions } from '@/components/SourceActions'
import { SchedulerControls } from '@/components/SchedulerControls'

export const dynamic = 'force-dynamic'

export default async function SourcesPage() {
  await bootstrap()
  const sources = listSources()
  const feeds = listFeeds()
  const feedMap = Object.fromEntries(feeds.map((f) => [f.id, f]))
  const adapters = listAdapters()
  const scheduler = getSchedulerStatus()
  const recentRuns = listIngestRuns(10)
  const summary = {
    total: sources.length,
    ok: sources.filter((s) => s.status === 'ok').length,
    error: sources.filter((s) => s.status === 'error').length,
    pending: sources.filter((s) => s.status === 'pending').length,
    disabled: sources.filter((s) => s.enabled === false).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-[var(--ink)]">Source diagnostics</h1>
        <p className="text-[var(--ink-soft)] mt-1">
          {summary.ok} ok · {summary.error} error · {summary.pending} pending · {summary.disabled}{' '}
          disabled · {summary.total} total
        </p>
        <p className="text-xs text-[var(--ink-soft)] mt-1">
          Adapters: {adapters.map((a) => `${a.id} (${a.kinds.join('/')})`).join(' · ')}
        </p>
      </div>

      <SchedulerControls status={scheduler} />

      <SourceManager feeds={feeds.map((f) => ({ id: f.id, title: f.title }))} />

      <div className="overflow-x-auto border border-[var(--line)] bg-white/40">
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)] border-b border-[var(--line)]">
            <tr>
              <th className="px-3 py-2">Feed</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Kind / adapter</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Stats</th>
              <th className="px-3 py-2">Last fetch</th>
              <th className="px-3 py-2">Error</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-b border-[var(--line)] align-top">
                <td className="px-3 py-2">{feedMap[s.feedId]?.title || s.feedId}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">
                    {s.title}
                    {s.enabled === false ? (
                      <span className="ml-2 text-xs uppercase tracking-wide text-[var(--ink-soft)]">
                        disabled
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-[var(--ink-soft)] break-all max-w-md">{s.url}</div>
                </td>
                <td className="px-3 py-2">
                  <div>{s.kind}</div>
                  <div className="text-xs text-[var(--ink-soft)]">{s.adapterId || '—'}</div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`badge ${
                      s.status === 'ok' ? 'badge-live' : s.status === 'error' ? 'badge-demo' : ''
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-[var(--ink-soft)] whitespace-nowrap">
                  <div>fetches {s.fetchCount ?? 0}</div>
                  <div>items {s.lastItemCount ?? '—'}</div>
                  <div>
                    {s.lastDurationMs != null ? `${s.lastDurationMs}ms` : '—'}
                    {(s.consecutiveFailures || 0) > 0
                      ? ` · fail×${s.consecutiveFailures}`
                      : ''}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  {s.lastFetchedAt
                    ? new Date(s.lastFetchedAt).toLocaleString('en-NZ', {
                        timeZone: 'Pacific/Auckland',
                      })
                    : '—'}
                </td>
                <td className="px-3 py-2 text-red-700 max-w-xs text-xs">{s.lastError || '—'}</td>
                <td className="px-3 py-2">
                  <SourceActions sourceId={s.id} enabled={s.enabled !== false} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recentRuns.length > 0 && (
        <div className="border border-[var(--line)] bg-white/40 p-4 space-y-2">
          <h2 className="font-display text-2xl text-[var(--ink)]">Recent ingest runs</h2>
          <ul className="text-sm space-y-1">
            {recentRuns.map((run) => (
              <li key={run.id} className="text-[var(--ink-soft)]">
                <span className="text-[var(--ink)]">{run.trigger}</span>
                {run.feedId ? ` · feed ${run.feedId.slice(0, 8)}` : ''}
                {run.sourceId ? ` · source ${run.sourceId.slice(0, 8)}` : ''}
                {run.ingested != null ? ` · +${run.ingested}` : ''}
                {run.durationMs != null ? ` · ${run.durationMs}ms` : ''}
                {run.error ? ` · ${run.error}` : ''}
                {run.errors?.length ? ` · ${run.errors.length} source errors` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
