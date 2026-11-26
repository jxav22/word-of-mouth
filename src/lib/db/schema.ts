import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const feeds = sqliteTable('feeds', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  query: text('query').notNull(),
  keywords: text('keywords').notNull(), // JSON array
  topics: text('topics').notNull(), // JSON array
  relevanceThreshold: real('relevance_threshold').notNull().default(0.2),
  refreshIntervalMin: integer('refresh_interval_min').notNull().default(30),
  isDemo: integer('is_demo', { mode: 'boolean' }).notNull().default(false),
  shareToken: text('share_token'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const sources = sqliteTable('sources', {
  id: text('id').primaryKey(),
  feedId: text('feed_id')
    .notNull()
    .references(() => feeds.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  url: text('url').notNull(),
  title: text('title').notNull(),
  status: text('status').notNull().default('pending'),
  lastFetchedAt: text('last_fetched_at'),
  lastError: text('last_error'),
})

export const articles = sqliteTable('articles', {
  id: text('id').primaryKey(),
  canonicalUrl: text('canonical_url').notNull().unique(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  contentText: text('content_text').notNull(),
  publishedAt: text('published_at'),
  author: text('author'),
  sourceId: text('source_id')
    .notNull()
    .references(() => sources.id, { onDelete: 'cascade' }),
  sourceTitle: text('source_title').notNull(),
  isDemo: integer('is_demo', { mode: 'boolean' }).notNull().default(false),
  clusterId: text('cluster_id'),
})

export const feedItems = sqliteTable('feed_items', {
  id: text('id').primaryKey(),
  feedId: text('feed_id')
    .notNull()
    .references(() => feeds.id, { onDelete: 'cascade' }),
  articleId: text('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  score: real('score').notNull(),
  reasons: text('reasons').notNull(), // JSON array
  feedback: text('feedback'),
  seenAt: text('seen_at'),
})
