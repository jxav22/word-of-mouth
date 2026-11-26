import type { SourceKind } from '../types'
import { demoAdapter } from './demo'
import { hnAdapter } from './hn'
import { jsonApiAdapter } from './json-api'
import { redditAdapter } from './reddit'
import { rssAdapter } from './rss'
import type { SourceAdapter, SourceAdapterContext, SourceAdapterResult } from './types'

const adapters: SourceAdapter[] = [
  demoAdapter,
  hnAdapter,
  redditAdapter,
  rssAdapter,
  jsonApiAdapter,
]

/** Register an additional adapter at runtime (tests / extensions). */
export function registerAdapter(adapter: SourceAdapter) {
  const idx = adapters.findIndex((a) => a.id === adapter.id)
  if (idx >= 0) adapters[idx] = adapter
  else adapters.push(adapter)
}

export function listAdapters(): Array<{ id: string; kinds: SourceKind[] }> {
  return adapters.map((a) => ({ id: a.id, kinds: a.kinds }))
}

export function resolveAdapter(kind: SourceKind, url: string): SourceAdapter | null {
  // Strong URL hints win regardless of declared kind (mis-tagged sources).
  const urlHint = adapters.find((a) => a.id !== 'demo' && a.match?.(url))
  if (urlHint && (kind === 'api' || kind === urlHint.kinds[0] || urlHint.kinds.includes(kind))) {
    return urlHint
  }
  if (urlHint && kind === 'rss' && urlHint.id === 'hn') return urlHint
  if (urlHint && kind === 'api') return urlHint

  const kindMatches = adapters.filter((a) => a.kinds.includes(kind))
  if (kindMatches.length === 0) {
    // Fallback: treat unknown/api-ish as JSON if no kind match
    if (kind === 'api') return adapters.find((a) => a.id === 'json-api') || null
    return null
  }

  const byUrl = kindMatches.find((a) => a.match?.(url))
  if (byUrl) return byUrl

  return kindMatches[0] || null
}

export async function fetchWithAdapter(ctx: SourceAdapterContext): Promise<SourceAdapterResult> {
  const adapter = resolveAdapter(ctx.kind, ctx.url)
  if (!adapter) {
    return { articles: [], error: `No adapter for kind=${ctx.kind}` }
  }
  try {
    const result = await adapter.fetch(ctx)
    return {
      ...result,
      meta: {
        adapter: adapter.id,
        ...result.meta,
        itemCount: result.meta?.itemCount ?? result.articles.length,
      },
    }
  } catch (err) {
    return {
      articles: [],
      error: err instanceof Error ? err.message : 'Adapter failed',
      meta: { adapter: adapter.id },
    }
  }
}
