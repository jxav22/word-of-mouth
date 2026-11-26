import { ModeBadge } from '@/components/ModeBadge'
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
          {summary.disabled} disabled · {summary.total} total
        </p>
        <p className="mt-1 text-xs text-[var(--ink-muted)]">
          Adapters: {adapters.map((a) => `${a.id} (${a.kinds.join('/')})`).join(' · ')}
        </p>
      </div>

      <SchedulerControls status={scheduler} />

      <SourceManager feeds={feeds.map((f) => ({ id: f.id, title: f.title }))} />

      {/* Mobile: stacked cards */}
      <ul className="space-y-3 md:hidden">
        {sources.map((s) => {
          const feed = feedMap[s.feedId]
          return (
            <li key={s.id} className="space-y-1.5 border border-[var(--line)] bg-white/40 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-[var(--ink)]">{s.title}</span>
                <span
                  className={`badge ${s.status === 'ok' ? 'badge-live' : s.status === 'error' ? 'badge-demo' : ''}`}
                >
                  {s.status}
                </span>
                {s.enabled === false ? (
                  <span className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">disabled</span>
                ) : null}
              </div>
              <p className="text-sm text-[var(--ink-soft)]">{feed?.title || s.feedId}</p>
              {feed && <ModeBadge demo={feed.isDemo} />}
              <p className="section-label">
                {s.kind}
                {s.adapterId ? ` · ${s.adapterId}` : ''}
                {s.lastFetchedAt
                  ? ` · ${new Date(s.lastFetchedAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })} NZDT`
                  : ''}
              </p>
              <p className="break-all text-xs text-[var(--ink-muted)]">{s.url}</p>
              {s.lastError && <p className="text-xs text-red-700">{s.lastError}</p>}
              <SourceActions sourceId={s.id} enabled={s.enabled !== false} />
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
              <th className="px-3 py-2.5 font-normal">Kind / adapter</th>
              <th className="px-3 py-2.5 font-normal">Status</th>
              <th className="px-3 py-2.5 font-normal">Stats</th>
              <th className="px-3 py-2.5 font-normal">Last fetch</th>
              <th className="px-3 py-2.5 font-normal">Error</th>
              <th className="px-3 py-2.5 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => {
              const feed = feedMap[s.feedId]
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
                    <div className="font-medium">
                      {s.title}
                      {s.enabled === false ? (
                        <span className="ml-2 text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                          disabled
                        </span>
                      ) : null}
                    </div>
                    <div className="max-w-md break-all text-xs text-[var(--ink-muted)]">{s.url}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div>{s.kind}</div>
                    <div className="text-xs text-[var(--ink-muted)]">{s.adapterId || '—'}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`badge ${
                        s.status === 'ok' ? 'badge-live' : s.status === 'error' ? 'badge-demo' : ''
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-[var(--ink-muted)]">
                    <div>fetches {s.fetchCount ?? 0}</div>
                    <div>items {s.lastItemCount ?? '—'}</div>
                    <div>
                      {s.lastDurationMs != null ? `${s.lastDurationMs}ms` : '—'}
                      {(s.consecutiveFailures || 0) > 0 ? ` · fail×${s.consecutiveFailures}` : ''}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[var(--ink-muted)]">
                    {s.lastFetchedAt
                      ? new Date(s.lastFetchedAt).toLocaleString('en-NZ', {
                          timeZone: 'Pacific/Auckland',
                        })
                      : '—'}
                  </td>
                  <td className="max-w-xs px-3 py-2.5 text-xs text-red-700">{s.lastError || '—'}</td>
                  <td className="px-3 py-2.5">
                    <SourceActions sourceId={s.id} enabled={s.enabled !== false} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {recentRuns.length > 0 && (
        <div className="space-y-2 border border-[var(--line)] bg-white/40 p-4">
          <h2 className="font-display text-2xl text-[var(--ink)]">Recent ingest runs</h2>
          <ul className="space-y-1 text-sm">
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
