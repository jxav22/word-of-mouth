export type Feed = {
  id: string
  slug: string
  title: string
  query: string
  keywords: string[]
  topics: string[]
  relevanceThreshold: number
  refreshIntervalMin: number
  isDemo: boolean
  shareToken?: string | null
  createdAt: string
  updatedAt: string
}

export type SourceKind = 'rss' | 'hn' | 'reddit' | 'api' | 'demo'

export type Source = {
  id: string
  feedId: string
  kind: SourceKind
  url: string
  title: string
  status: 'ok' | 'error' | 'pending'
  lastFetchedAt?: string | null
  lastError?: string | null
  lastSuccessAt?: string | null
  fetchCount?: number
  consecutiveFailures?: number
  lastDurationMs?: number | null
  lastItemCount?: number | null
  adapterId?: string | null
  enabled?: boolean
}

export type Article = {
  id: string
  canonicalUrl: string
  title: string
  summary: string
  contentText: string
  publishedAt?: string | null
  author?: string | null
  sourceId: string
  sourceTitle: string
  isDemo: boolean
  clusterId?: string | null
}

export type FeedItem = {
  id: string
  feedId: string
  articleId: string
  score: number
  reasons: string[]
  feedback?: 'up' | 'down' | null
  seenAt?: string | null
}

export type FeedItemView = FeedItem & {
  article: Article
}

export type RawArticle = {
  canonicalUrl: string
  title: string
  contentText: string
  publishedAt?: string
  author?: string
  sourceTitle: string
  isDemo?: boolean
}
