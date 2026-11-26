import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb, schema } from '../db'
import { dedupeArticles, clusterIdFor } from '../cluster/dedupe'
import { rankArticles } from '../rank'
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
      collected.push({ ...article, sourceId: source.id, sourceTitle: article.sourceTitle || source.title })
    }
  }

  const { kept } = dedupeArticles(collected)
  const ranked = rankArticles(kept, keywords, topics, feed.relevanceThreshold)

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
      const { summary } = await summariseArticle(item.title, item.contentText, keywords)
      db.insert(schema.articles)
        .values({
          id: articleId,
          canonicalUrl: item.canonicalUrl,
          title: item.title,
          summary,
          contentText: item.contentText,
          publishedAt: item.publishedAt || null,
          author: item.author || null,
          sourceId: item.sourceId,
          sourceTitle: item.sourceTitle,
          isDemo: Boolean(item.isDemo),
          clusterId: clusterIdFor(item.title),
        })
        .run()
      ingested++
    }

    const alreadyLinked = db
      .select()
      .from(schema.feedItems)
      .where(eq(schema.feedItems.feedId, feedId))
      .all()
      .find((fi) => fi.articleId === articleId)

    if (!alreadyLinked && articleId) {
      db.insert(schema.feedItems)
        .values({
          id: nanoid(),
          feedId,
          articleId,
          score: item.score,
          reasons: JSON.stringify(item.reasons),
          feedback: null,
          seenAt: null,
        })
        .run()
    } else if (alreadyLinked) {
      db.update(schema.feedItems)
        .set({ score: item.score, reasons: JSON.stringify(item.reasons) })
        .where(eq(schema.feedItems.id, alreadyLinked.id))
        .run()
    }
  }

  db.update(schema.feeds)
    .set({ updatedAt: new Date().toISOString() })
    .where(eq(schema.feeds.id, feedId))
    .run()

  return { ingested, ranked: ranked.length, errors }
}
