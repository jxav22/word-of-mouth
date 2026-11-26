import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb, schema } from '../db'
import { clusterStories, dedupeArticles, canonicalizeUrl } from '../cluster/dedupe'
import { rankArticles } from '../rank'
import { prefsFromFeedbackHistory } from '../feeds/refine'
import { summariseArticle } from '../summarise'
import { fetchWithAdapter } from '../sources/registry'
import { normalizeArticles } from './normalize'
import { recordIngestRun, updateIngestRun } from './diagnostics'
import type { RawArticle, SourceKind } from '../types'

async function ingestSource(
  source: typeof schema.sources.$inferSelect,
  keywords: string[] = [],
): Promise<{ articles: RawArticle[]; error?: string; adapterId?: string; itemCount?: number }> {
  const result = await fetchWithAdapter({
    sourceId: source.id,
    feedId: source.feedId,
    kind: source.kind as SourceKind,
    url: source.url,
    title: source.title,
    keywords,
  })
  return {
    articles: normalizeArticles(result.articles),
    error: result.error,
    adapterId: result.meta?.adapter,
    itemCount: result.meta?.itemCount ?? result.articles.length,
  }
}

function markSourceResult(
  source: typeof schema.sources.$inferSelect,
  opts: {
    ok: boolean
    error?: string
    adapterId?: string
    itemCount?: number
    durationMs: number
  },
) {
  const db = getDb()
  const now = new Date().toISOString()
  if (opts.ok) {
    db.update(schema.sources)
      .set({
        status: 'ok',
        lastFetchedAt: now,
        lastSuccessAt: now,
        lastError: null,
        fetchCount: (source.fetchCount ?? 0) + 1,
        consecutiveFailures: 0,
        lastDurationMs: opts.durationMs,
        lastItemCount: opts.itemCount ?? 0,
        adapterId: opts.adapterId || source.adapterId,
      })
      .where(eq(schema.sources.id, source.id))
      .run()
  } else {
    db.update(schema.sources)
      .set({
        status: 'error',
        lastFetchedAt: now,
        lastError: opts.error || 'Unknown error',
        fetchCount: (source.fetchCount ?? 0) + 1,
        consecutiveFailures: (source.consecutiveFailures ?? 0) + 1,
        lastDurationMs: opts.durationMs,
        lastItemCount: 0,
        adapterId: opts.adapterId || source.adapterId,
      })
      .where(eq(schema.sources.id, source.id))
      .run()
  }
}

export async function refreshSource(sourceId: string): Promise<{
  sourceId: string
  articles: number
  error?: string
  adapterId?: string
  durationMs: number
}> {
  const db = getDb()
  const source = db.select().from(schema.sources).where(eq(schema.sources.id, sourceId)).get()
  if (!source) throw new Error('Source not found')

  const feed = db.select().from(schema.feeds).where(eq(schema.feeds.id, source.feedId)).get()
  const keywords = feed ? (JSON.parse(feed.keywords) as string[]) : []
  const runId = nanoid(8)
  const started = Date.now()
  recordIngestRun({
    id: runId,
    startedAt: new Date().toISOString(),
    trigger: 'source',
    feedId: source.feedId,
    sourceId,
  })

  if (source.enabled === false) {
    const durationMs = Date.now() - started
    updateIngestRun(runId, {
      finishedAt: new Date().toISOString(),
      durationMs,
      error: 'Source disabled',
    })
    return { sourceId, articles: 0, error: 'Source disabled', durationMs }
  }

  if (source.kind === 'demo') {
    markSourceResult(source, { ok: true, adapterId: 'demo', itemCount: 0, durationMs: Date.now() - started })
    const durationMs = Date.now() - started
    updateIngestRun(runId, { finishedAt: new Date().toISOString(), durationMs, ingested: 0 })
    return { sourceId, articles: 0, adapterId: 'demo', durationMs }
  }

  const result = await ingestSource(source, keywords)
  const durationMs = Date.now() - started
  if (result.error) {
    markSourceResult(source, {
      ok: false,
      error: result.error,
      adapterId: result.adapterId,
      durationMs,
    })
    updateIngestRun(runId, {
      finishedAt: new Date().toISOString(),
      durationMs,
      error: result.error,
      errors: [result.error],
    })
    return { sourceId, articles: 0, error: result.error, adapterId: result.adapterId, durationMs }
  }

  markSourceResult(source, {
    ok: true,
    adapterId: result.adapterId,
    itemCount: result.itemCount,
    durationMs,
  })

  // Persist via full feed refresh ranking path for consistency
  const feedRefresh = await refreshFeed(source.feedId, {
    trigger: 'source',
    onlySourceId: source.id,
    prefetched: [{ sourceId: source.id, articles: result.articles }],
  })

  updateIngestRun(runId, {
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    ingested: feedRefresh.ingested,
    ranked: feedRefresh.ranked,
    errors: feedRefresh.errors,
  })

  return {
    sourceId,
    articles: result.articles.length,
    adapterId: result.adapterId,
    durationMs: Date.now() - started,
  }
}

export async function refreshFeed(
  feedId: string,
  opts?: {
    trigger?: 'scheduler' | 'manual' | 'create' | 'source'
    onlySourceId?: string
    prefetched?: Array<{ sourceId: string; articles: RawArticle[] }>
  },
): Promise<{
  ingested: number
  ranked: number
  clusters: number
  errors: string[]
  sourcesAttempted: number
  durationMs: number
}> {
  const db = getDb()
  const feed = db.select().from(schema.feeds).where(eq(schema.feeds.id, feedId)).get()
  if (!feed) throw new Error('Feed not found')

  const runId = nanoid(8)
  const started = Date.now()
  const trigger = opts?.trigger || 'manual'
  if (trigger !== 'source') {
    recordIngestRun({
      id: runId,
      startedAt: new Date().toISOString(),
      trigger,
      feedId,
    })
  }

  const feedSources = db
    .select()
    .from(schema.sources)
    .where(eq(schema.sources.feedId, feedId))
    .all()
    .filter((s) => (opts?.onlySourceId ? s.id === opts.onlySourceId : true))
    .filter((s) => s.enabled !== false)

  const keywords = JSON.parse(feed.keywords) as string[]
  const topics = JSON.parse(feed.topics) as string[]
  const excludeKeywords = JSON.parse(feed.excludeKeywords || '[]') as string[]
  const errors: string[] = []
  const collected: Array<RawArticle & { sourceId: string }> = []
  const prefetched = new Map((opts?.prefetched || []).map((p) => [p.sourceId, p.articles]))

  for (const source of feedSources) {
    if (source.kind === 'demo') {
      markSourceResult(source, { ok: true, adapterId: 'demo', itemCount: 0, durationMs: 0 })
      continue
    }

    if (prefetched.has(source.id)) {
      for (const article of prefetched.get(source.id)!) {
        collected.push({
          ...article,
          sourceId: source.id,
          sourceTitle: article.sourceTitle || source.title,
        })
      }
      continue
    }

    const t0 = Date.now()
    const result = await ingestSource(source, keywords)
    const durationMs = Date.now() - t0
    if (result.error) {
      errors.push(`${source.title}: ${result.error}`)
      markSourceResult(source, {
        ok: false,
        error: result.error,
        adapterId: result.adapterId,
        durationMs,
      })
      continue
    }

    markSourceResult(source, {
      ok: true,
      adapterId: result.adapterId,
      itemCount: result.itemCount,
      durationMs,
    })

    for (const article of result.articles) {
      collected.push({
        ...article,
        canonicalUrl: canonicalizeUrl(article.canonicalUrl) || article.canonicalUrl,
        sourceId: source.id,
        sourceTitle: article.sourceTitle || source.title,
      })
    }
  }

  // Hard dedupe exact/near-exact, then soft-cluster remaining for story ids
  const { kept } = dedupeArticles(collected, 0.78)
  const { clusters, indexed } = clusterStories(kept, 0.55)

  const feedbackRows = db
    .select({
      feedback: schema.feedItems.feedback,
      title: schema.articles.title,
      contentText: schema.articles.contentText,
    })
    .from(schema.feedItems)
    .innerJoin(schema.articles, eq(schema.feedItems.articleId, schema.articles.id))
    .where(eq(schema.feedItems.feedId, feedId))
    .all()
  const prefs = prefsFromFeedbackHistory(feedbackRows)

  const ranked = rankArticles(indexed, keywords, topics, feed.relevanceThreshold, {
    excludeKeywords,
    prefs,
    queryText: `${feed.query} ${keywords.join(' ')}`,
  })

  let ingested = 0
  for (const item of ranked.slice(0, 80)) {
    const existing = db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.canonicalUrl, item.canonicalUrl))
      .get()

    let articleId = existing?.id
    if (!existing) {
      articleId = nanoid()
      const { summary, attribution, provider } = await summariseArticle(item.title, item.contentText, {
        keywords,
        sourceTitle: item.sourceTitle,
        author: item.author,
      })
      db.insert(schema.articles)
        .values({
          id: articleId,
          canonicalUrl: item.canonicalUrl,
          title: item.title,
          summary,
          summaryAttribution: attribution,
          contentText: item.contentText,
          publishedAt: item.publishedAt || null,
          author: item.author || null,
          sourceId: item.sourceId,
          sourceTitle: item.sourceTitle,
          isDemo: Boolean(item.isDemo),
          clusterId: item.clusterId,
        })
        .run()
      ingested++
      void provider
    } else if (!existing.clusterId && item.clusterId) {
      db.update(schema.articles)
        .set({ clusterId: item.clusterId })
        .where(eq(schema.articles.id, existing.id))
        .run()
    }

    const alreadyLinked = db
      .select()
      .from(schema.feedItems)
      .where(eq(schema.feedItems.feedId, feedId))
      .all()
      .find((fi) => fi.articleId === articleId)

    const reasons = [...item.reasons]
    if (item.clusterId) reasons.push(`cluster:${item.clusterId}`)

    if (!alreadyLinked && articleId) {
      db.insert(schema.feedItems)
        .values({
          id: nanoid(),
          feedId,
          articleId,
          score: item.score,
          reasons: JSON.stringify(reasons.slice(0, 8)),
          feedback: null,
          seenAt: null,
        })
        .run()
    } else if (alreadyLinked) {
      db.update(schema.feedItems)
        .set({ score: item.score, reasons: JSON.stringify(reasons.slice(0, 8)) })
        .where(eq(schema.feedItems.id, alreadyLinked.id))
        .run()
    }
  }

  db.update(schema.feeds)
    .set({ updatedAt: new Date().toISOString() })
    .where(eq(schema.feeds.id, feedId))
    .run()

  const durationMs = Date.now() - started
  if (trigger !== 'source') {
    updateIngestRun(runId, {
      finishedAt: new Date().toISOString(),
      durationMs,
      ingested,
      ranked: ranked.length,
      errors,
    })
  }

  return {
    ingested,
    ranked: ranked.length,
    clusters: clusters.length,
    errors,
    sourcesAttempted: feedSources.length,
    durationMs,
  }
}
