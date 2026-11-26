import Link from 'next/link'

export type SourceWarning = {
  title: string
  kind?: string
  message: string
}

/** Non-blocking ingest / source failure callout for create handoff and feed browse. */
export function SourceWarningsBanner({
  warnings,
  justCreated = false,
  diagnosticsHref = '/sources',
}: {
  warnings: SourceWarning[]
  justCreated?: boolean
  diagnosticsHref?: string
}) {
  if (warnings.length === 0) return null

  return (
    <aside
      className="animate-rise space-y-2 border border-[rgba(217,119,47,0.45)] bg-[rgba(217,119,47,0.1)] px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-[var(--ember-deep)]">
          {justCreated
            ? `Feed created with ${warnings.length} source warning${warnings.length === 1 ? '' : 's'}`
            : `${warnings.length} source warning${warnings.length === 1 ? '' : 's'}`}
        </p>
        <Link href={diagnosticsHref} className="text-xs text-[var(--teal)] hover:underline">
          Source diagnostics →
        </Link>
      </div>
      <p className="text-xs text-[var(--ink-soft)]">
        The feed still works from healthy sources. Failed adapters (often Reddit/HN egress) can be
        refreshed later.
      </p>
      <ul className="space-y-1.5 text-sm text-[var(--ink-soft)]">
        {warnings.slice(0, 5).map((w) => (
          <li key={`${w.title}-${w.message}`} className="leading-snug">
            <span className="font-medium text-[var(--ink)]">{w.title}</span>
            {w.kind ? <span className="text-[var(--ink-muted)]"> · {w.kind}</span> : null}
            <span className="text-[var(--ember-deep)]"> — {w.message}</span>
          </li>
        ))}
        {warnings.length > 5 ? (
          <li className="text-xs text-[var(--ink-muted)]">+{warnings.length - 5} more</li>
        ) : null}
      </ul>
    </aside>
  )
}
