import { eq, desc, like, or, and, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb, schema } from '../db'
import { parseFeedQuery, makeSlug } from './parse'
import { refineFromFeedback, prefsFromFeedbackHistory } from './refine'
import { refreshFeed } from '../ingest/pipeline'
import { DEMO_FEEDS } from '../demo/fixtures'
import { summariseArticle } from '../summarise'
import { clusterIdFor } from '../cluster/dedupe'
import { rankArticles } from '../rank'
import type { Feed, FeedItemView, Source } from '../types'

function mapFeed(row: typeof schema.feeds.$inferSelect): Feed {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    query: row.query,
    keywords: JSON.parse(row.keywords) as string[],
    topics: JSON.parse(row.topics) as string[],
    excludeKeywords: JSON.parse(row.excludeKeywords || '[]') as string[],
    relevanceThreshold: row.relevanceThreshold,
    refreshIntervalMin: row.refreshIntervalMin,
    isDemo: row.isDemo,
    shareToken: row.shareToken,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function mapSource(row: typeof schema.sources.$inferSelect): Source {
  return {
    id: row.id,
    feedId: row.feedId,
    kind: row.kind as Source['kind'],
    url: row.url,
    title: row.title,
    status: row.status as Source['status'],
    lastFetchedAt: row.lastFetchedAt,
    lastError: row.lastError,
  }
}

function mapArticle(article: typeof schema.articles.$inferSelect): Article {
  return {
    id: article.id,
    canonicalUrl: article.canonicalUrl,
    title: article.title,
    summary: article.summary,
    summaryAttribution: article.summaryAttribution,
    contentText: article.contentText,
    publishedAt: article.publishedAt,
    author: article.author,
    sourceId: article.sourceId,
    sourceTitle: article.sourceTitle,
    isDemo: article.isDemo,
    clusterId: article.clusterId,
  }
}

export function listFeeds(): Feed[] {
  const db = getDb()
  return db.select().from(schema.feeds).orderBy(desc(schema.feeds.createdAt)).all().map(mapFeed)
}

export function getFeedByIdOrSlug(idOrSlug: string): Feed | null {
  const db = getDb()
  const row =
    db.select().from(schema.feeds).where(eq(schema.feeds.id, idOrSlug)).get() ||
    db.select().from(schema.feeds).where(eq(schema.feeds.slug, idOrSlug)).get()
  return row ? mapFeed(row) : null
}

export function getFeedByShareToken(token: string): Feed | null {
  const db = getDb()
  const row = db.select().from(schema.feeds).where(eq(schema.feeds.shareToken, token)).get()
  return row ? mapFeed(row) : null
}

export function listSources(feedId?: string): Source[] {
  const db = getDb()
  const rows = feedId
    ? db.select().from(schema.sources).where(eq(schema.sources.feedId, feedId)).all()
    : db.select().from(schema.sources).all()
  return rows.map(mapSource)
}

export function getFeedItems(feedId: string, opts?: { q?: string; limit?: number }): FeedItemView[] {
  const db = getDb()
  const limit = opts?.limit ?? 50
  const rows = db
    .select({
      item: schema.feedItems,
      article: schema.articles,
    })
    .from(schema.feedItems)
    .innerJoin(schema.articles, eq(schema.feedItems.articleId, schema.articles.id))
    .where(eq(schema.feedItems.feedId, feedId))
    .orderBy(desc(schema.feedItems.score))
    .all()

  let items: FeedItemView[] = rows.map(({ item, article }) => ({
    id: item.id,
    feedId: item.feedId,
    articleId: item.articleId,
    score: item.score,
    reasons: JSON.parse(item.reasons) as string[],
    feedback: (item.feedback as 'up' | 'down' | null) || null,
    seenAt: item.seenAt,
    article: mapArticle(article),
  }))

  if (opts?.q) {
    const q = opts.q.toLowerCase()
    items = items.filter(
      (i) =>
        i.article.title.toLowerCase().includes(q) ||
        i.article.summary.toLowerCase().includes(q) ||
        i.article.contentText.toLowerCase().includes(q),
    )
  }

  return items.slice(0, limit)
}

export function getArticleForFeed(feedId: string, articleId: string): FeedItemView | null {
  return getFeedItems(feedId, { limit: 500 }).find((i) => i.articleId === articleId) || null
}

export async function createFeed(input: {
  query: string
  title?: string
  ingest?: boolean
}): Promise<{
  feed: Feed
  configQuality: number
  intent: string
  ingest?: { ingested: number; ranked: number; clusters: number; errors: string[] }
}> {
  const parsed = parseFeedQuery(input.query, input.title)
  const db = getDb()
  const now = new Date().toISOString()
  const id = nanoid()
  const slug = makeSlug(parsed.title, id.slice(0, 6))
  const shareToken = nanoid(12)

  db.insert(schema.feeds)
    .values({
      id,
      slug,
      title: parsed.title,
      query: input.query.trim(),
      keywords: JSON.stringify(parsed.keywords),
      topics: JSON.stringify(parsed.topics),
      excludeKeywords: JSON.stringify(parsed.excludeKeywords),
      relevanceThreshold: parsed.relevanceThreshold,
      refreshIntervalMin: 30,
      isDemo: false,
      shareToken,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  for (const src of parsed.suggestedSources) {
    db.insert(schema.sources)
      .values({
        id: nanoid(),
        feedId: id,
        kind: src.kind,
        url: src.url,
        title: src.title,
        status: 'pending',
        lastFetchedAt: null,
        lastError: null,
      })
      .run()
  }

  let ingestResult
  if (input.ingest !== false) {
    ingestResult = await refreshFeed(id)
  }

  const feed = getFeedByIdOrSlug(id)!
  return {
    feed,
    configQuality: parsed.configQuality,
    intent: parsed.intent,
    ingest: ingestResult,
  }
}

export function ensureShareToken(feedId: string): string {
  const db = getDb()
  const feed = db.select().from(schema.feeds).where(eq(schema.feeds.id, feedId)).get()
  if (!feed) throw new Error('Feed not found')
  if (feed.shareToken) return feed.shareToken
  const token = nanoid(12)
  db.update(schema.feeds).set({ shareToken: token }).where(eq(schema.feeds.id, feedId)).run()
  return token
}

/** Re-score existing feed items after keyword / threshold / prefs change. */
export function rerankFeedItems(feedId: string): number {
  const db = getDb()
  const feed = db.select().from(schema.feeds).where(eq(schema.feeds.id, feedId)).get()
  if (!feed) throw new Error('Feed not found')

  const keywords = JSON.parse(feed.keywords) as string[]
  const topics = JSON.parse(feed.topics) as string[]
  const excludeKeywords = JSON.parse(feed.excludeKeywords || '[]') as string[]

  const rows = db
    .select({
      item: schema.feedItems,
      article: schema.articles,
    })
    .from(schema.feedItems)
    .innerJoin(schema.articles, eq(schema.feedItems.articleId, schema.articles.id))
    .where(eq(schema.feedItems.feedId, feedId))
    .all()

  const prefs = prefsFromFeedbackHistory(
    rows.map(({ item, article }) => ({
      feedback: item.feedback,
      title: article.title,
      contentText: article.contentText,
    })),
  )

  const ranked = rankArticles(
    rows.map(({ article }) => ({
      id: article.id,
      title: article.title,
      contentText: article.contentText,
      publishedAt: article.publishedAt,
      canonicalUrl: article.canonicalUrl,
      sourceTitle: article.sourceTitle,
    })),
    keywords,
    topics,
    0, // keep all linked items; threshold applies on ingest
    {
      excludeKeywords,
      prefs,
      queryText: `${feed.query} ${keywords.join(' ')}`,
    },
  )

  const byArticle = new Map(ranked.map((r) => [r.id, r]))
  let updated = 0
  for (const { item, article } of rows) {
    const scored = byArticle.get(article.id)
    if (!scored) continue
    db.update(schema.feedItems)
      .set({
        score: scored.score,
        reasons: JSON.stringify(scored.reasons),
      })
      .where(eq(schema.feedItems.id, item.id))
      .run()
    updated++
  }
  return updated
}

export function setFeedback(feedId: string, itemId: string, vote: 'up' | 'down' | null) {
  const db = getDb()
  const item = db.select().from(schema.feedItems).where(eq(schema.feedItems.id, itemId)).get()
  if (!item || item.feedId !== feedId) throw new Error('Item not found')

  const article = db
    .select()
    .from(schema.articles)
    .where(eq(schema.articles.id, item.articleId))
    .get()
  if (!article) throw new Error('Article not found')

  db.update(schema.feedItems)
    .set({ feedback: vote })
    .where(eq(schema.feedItems.id, itemId))
    .run()

  const feed = db.select().from(schema.feeds).where(eq(schema.feeds.id, feedId)).get()
  if (!feed) throw new Error('Feed not found')

  const refined = refineFromFeedback({
    keywords: JSON.parse(feed.keywords) as string[],
    excludeKeywords: JSON.parse(feed.excludeKeywords || '[]') as string[],
    relevanceThreshold: feed.relevanceThreshold,
    vote,
    articleTitle: article.title,
    articleContent: article.contentText,
  })

  db.update(schema.feeds)
    .set({
      keywords: JSON.stringify(refined.keywords),
      excludeKeywords: JSON.stringify(refined.excludeKeywords),
      relevanceThreshold: refined.relevanceThreshold,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.feeds.id, feedId))
    .run()

  const reranked = rerankFeedItems(feedId)
  return { refined, reranked }
}

export function patchFeed(
  feedId: string,
  patch: {
    keywords?: string[]
    excludeKeywords?: string[]
    relevanceThreshold?: number
    title?: string
  },
): Feed {
  const db = getDb()
  const feed = db.select().from(schema.feeds).where(eq(schema.feeds.id, feedId)).get()
  if (!feed) throw new Error('Feed not found')
  db.update(schema.feeds)
    .set({
      keywords: patch.keywords ? JSON.stringify(patch.keywords) : feed.keywords,
      excludeKeywords: patch.excludeKeywords
        ? JSON.stringify(patch.excludeKeywords)
        : feed.excludeKeywords,
      relevanceThreshold:
        patch.relevanceThreshold !== undefined ? patch.relevanceThreshold : feed.relevanceThreshold,
      title: patch.title ?? feed.title,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.feeds.id, feedId))
    .run()
  if (patch.keywords || patch.excludeKeywords || patch.relevanceThreshold !== undefined) {
    rerankFeedItems(feedId)
  }
  return getFeedByIdOrSlug(feedId)!
}

export function searchAll(q: string, feedId?: string) {
  const feeds = feedId ? ([getFeedByIdOrSlug(feedId)].filter(Boolean) as Feed[]) : listFeeds()
  const results: FeedItemView[] = []
  for (const feed of feeds) {
    results.push(...getFeedItems(feed.id, { q, limit: 30 }))
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 50)
}

export async function seedDemoFeeds(force = false): Promise<Feed[]> {
  const db = getDb()
  const existing = db
    .select()
    .from(schema.feeds)
    .where(eq(schema.feeds.isDemo, true))
    .all()
  if (existing.length >= 4 && !force) return existing.map(mapFeed)

  if (force) {
    for (const feed of existing) {
      db.delete(schema.feeds).where(eq(schema.feeds.id, feed.id)).run()
    }
  }

  const created: Feed[] = []
  for (const demo of DEMO_FEEDS) {
    const found = db.select().from(schema.feeds).where(eq(schema.feeds.slug, demo.slug)).get()
    if (found) {
      created.push(mapFeed(found))
      continue
    }

    const now = new Date().toISOString()
    const feedId = nanoid()
    db.insert(schema.feeds)
      .values({
        id: feedId,
        slug: demo.slug,
        title: demo.title,
        query: demo.query,
        keywords: JSON.stringify(demo.keywords),
        topics: JSON.stringify(demo.topics),
        excludeKeywords: JSON.stringify([]),
        relevanceThreshold: 0.1,
        refreshIntervalMin: 60,
        isDemo: true,
        shareToken: nanoid(12),
        createdAt: now,
        updatedAt: now,
      })
      .run()

    const sourceId = nanoid()
    db.insert(schema.sources)
      .values({
        id: sourceId,
        feedId,
        kind: 'demo',
        url: `demo://${demo.slug}`,
        title: `Demo fixtures · ${demo.title}`,
        status: 'ok',
        lastFetchedAt: now,
        lastError: null,
      })
      .run()

    const hnQuery = encodeURIComponent(demo.keywords.slice(0, 3).join(' '))
    db.insert(schema.sources)
      .values({
        id: nanoid(),
        feedId,
        kind: 'hn',
        url: `https://hn.algolia.com/api/v1/search_by_date?query=${hnQuery}&tags=story&hitsPerPage=20`,
        title: 'Hacker News (live)',
        status: 'pending',
        lastFetchedAt: null,
        lastError: null,
      })
      .run()

    const ranked = rankArticles(demo.articles, demo.keywords, demo.topics, 0.05, {
      queryText: `${demo.query} ${demo.keywords.join(' ')}`,
    })
    for (const article of ranked) {
      const articleId = nanoid()
      const { summary, attribution } = await summariseArticle(article.title, article.contentText, {
        keywords: demo.keywords,
        sourceTitle: article.sourceTitle,
        author: article.author,
      })
      db.insert(schema.articles)
        .values({
          id: articleId,
          canonicalUrl: article.canonicalUrl,
          title: article.title,
          summary,
          summaryAttribution: attribution,
          contentText: article.contentText,
          publishedAt: article.publishedAt || null,
          author: article.author || null,
          sourceId,
          sourceTitle: article.sourceTitle,
          isDemo: true,
          clusterId: clusterIdFor(article.title),
        })
        .run()
      db.insert(schema.feedItems)
        .values({
          id: nanoid(),
          feedId,
          articleId,
          score: article.score,
          reasons: JSON.stringify(article.reasons),
          feedback: null,
          seenAt: null,
        })
        .run()
    }

    created.push(getFeedByIdOrSlug(feedId)!)
  }

  return created
}

export function healthPayload() {
  const db = getDb()
  const feedCount = db.select({ c: sql<number>`count(*)` }).from(schema.feeds).get()?.c ?? 0
  const articleCount = db.select({ c: sql<number>`count(*)` }).from(schema.articles).get()?.c ?? 0
  return {
    ok: true,
    service: 'word-of-mouth',
    time: new Date().toISOString(),
    feeds: feedCount,
    articles: articleCount,
    ai: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    },
  }
}

void like
void or
void and
