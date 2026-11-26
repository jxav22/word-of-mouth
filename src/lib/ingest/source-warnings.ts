export type SourceWarning = {
  title: string
  kind?: string
  message: string
}

/**
 * Classify ingest error strings for SourceWarningsBanner.
 * Reddit dual-fail egress usually looks like `r/foo: rss: HTTP 404; json: HTTP 403`
 * — prefer `reddit` over the first `rss` token in that composite.
 */
export function classifyIngestErrorKind(message: string): string | undefined {
  if (/\breddit\b/i.test(message) || /(?:^|[\s:])r\/[A-Za-z0-9_]+/.test(message)) {
    return 'reddit'
  }
  // Composite RSS+JSON 403 is the Reddit adapter fallback signature
  if (/rss:\s*.+/i.test(message) && /json:\s*HTTP\s*403/i.test(message)) {
    return 'reddit'
  }
  const kindMatch = message.match(/\b(hn|rss|api|demo)\b/i)
  return kindMatch?.[1]?.toLowerCase()
}

/** Map create-feed `ingest.errors` strings → banner rows. */
export function mapIngestErrorsToWarnings(errors: string[]): SourceWarning[] {
  return errors.map((message) => ({
    title: 'Source ingest',
    kind: classifyIngestErrorKind(message),
    message,
  }))
}

/** Map persisted error sources → banner rows (feed detail / sources). */
export function mapErrorSourcesToWarnings(
  sources: Array<{ title: string; kind: string; lastError?: string | null; status?: string }>,
): SourceWarning[] {
  return sources
    .filter((s) => s.status === 'error' || Boolean(s.lastError))
    .map((s) => ({
      title: s.title,
      kind: s.kind,
      message: s.lastError || 'Fetch failed',
    }))
}
