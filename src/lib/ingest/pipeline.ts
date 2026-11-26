import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb, schema } from '../db'
import { clusterStories, dedupeArticles, canonicalizeUrl } from '../cluster/dedupe'
import { rankArticles } from '../rank'
import { prefsFromFeedbackHistory } from '../feeds/refine'
import { summariseArticle } from '../summarise'
import { fetchRss } from '../sources/rss'
import { fetchHn } from '../sources/hn'
import type { RawArticle } from '../types'

async function ingestSource(
  source: typeof schema.sources.$inferSelect,
): Promise<{ articles: RawArticle[]; error?: string }> {
  if (source.kind === 'hn' || source.url.includes('hn.algolia.com')) {
    return fetchHn(source.url)
  }
  if (source.kind === 'rss' || source.kind === 'api') {
    return fetchRss(source.url, source.title)
  }
  if (source.kind === 'demo') {
    return { articles: [] }
  }
  return { articles: [], error: `Unsupported source kind: ${source.kind}` }
}

export async function refreshFeed(feedId: string): Promise<{
  ingested: number
  ranked: number
  clusters: number
  errors: string[]
}> {
  const db = getDb()
  const feed = db.select().from(schema.feeds).where(eq(schema.feeds.id, feedId)).get()
  if (!feed) throw new Error('Feed not found')

  const feedSources = db
    .select()
    .from(schema.sources)
    .where(eq(schema.sources.feedId, feedId))
    .all()

  const keywords = JSON.parse(feed.keywords) as string[]
  const topics = JSON.parse(feed.topics) as string[]
  const excludeKeywords = JSON.parse(feed.excludeKeywords || '[]') as string[]
  const errors: string[] = []
  const collected: Array<RawArticle & { sourceId: string }> = []

  for (const source of feedSources) {
    if (source.kind === 'demo') {
      db.update(schema.sources)
        .set({ status: 'ok', lastFetchedAt: new Date().toISOString(), lastError: null })
        .where(eq(schema.sources.id, source.id))
        .run()
      continue
    }

    const result = await ingestSource(source)
    const now = new Date().toISOString()
    if (result.error) {
      errors.push(`${source.title}: ${result.error}`)
      db.update(schema.sources)
        .set({ status: 'error', lastFetchedAt: now, lastError: result.error })
        .where(eq(schema.sources.id, source.id))
        .run()
      continue
    }

    db.update(schema.sources)
      .set({ status: 'ok', lastFetchedAt: now, lastError: null })
      .where(eq(schema.sources.id, source.id))
      .run()

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

  return { ingested, ranked: ranked.length, clusters: clusters.length, errors }
}
