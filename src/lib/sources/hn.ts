import { safeFetch } from '../security/ssrf'
import { normalizeArticles, normalizeText, normalizeTitle, normalizePublishedAt } from '../ingest/normalize'
import type { RawArticle } from '../types'
import type { SourceAdapter } from './types'

type HnHit = {
  objectID?: string
  title?: string
  story_title?: string
  url?: string
  story_url?: string
  author?: string
  created_at?: string
  story_text?: string
  comment_text?: string
}

export async function fetchHn(apiUrl: string): Promise<{
  articles: RawArticle[]
  error?: string
  meta?: { adapter: string; fetchedBytes?: number; itemCount?: number }
}> {
  const fetched = await safeFetch(apiUrl)
  if (!fetched.ok) return { articles: [], error: fetched.reason }

  try {
    const data = JSON.parse(fetched.text) as { hits?: HnHit[] }
    const articles: RawArticle[] = (data.hits || [])
      .map((hit) => {
        const title = normalizeTitle(hit.title || hit.story_title || 'Untitled')
        const url =
          hit.url ||
          hit.story_url ||
          (hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : '')
        const content = normalizeText(hit.story_text || hit.comment_text || title)
        return {
          canonicalUrl: url,
          title,
          contentText: content,
          publishedAt: normalizePublishedAt(hit.created_at),
          author: hit.author,
          sourceTitle: 'Hacker News',
        }
      })
    const normalized = normalizeArticles(articles)
    return {
      articles: normalized,
      meta: {
        adapter: 'hn',
        fetchedBytes: Buffer.byteLength(fetched.text, 'utf8'),
        itemCount: normalized.length,
      },
    }
  } catch (err) {
    return { articles: [], error: err instanceof Error ? err.message : 'HN parse failed' }
  }
}

export const hnAdapter: SourceAdapter = {
  id: 'hn',
  kinds: ['hn'],
  match: (url) => url.includes('hn.algolia.com') || url.includes('news.ycombinator.com'),
  async fetch(ctx) {
    return fetchHn(ctx.url)
  },
}
