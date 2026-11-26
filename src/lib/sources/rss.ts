import Parser from 'rss-parser'
import { safeFetch } from '../security/ssrf'
import { normalizeArticles, normalizeText, normalizeTitle, normalizePublishedAt } from '../ingest/normalize'
import type { RawArticle } from '../types'
import type { SourceAdapter, SourceAdapterResult } from './types'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'WordOfMouthBot/0.1 (+https://github.com/jxav22/word-of-mouth)',
  },
})

export async function fetchRss(url: string, sourceTitle: string): Promise<{
  articles: RawArticle[]
  error?: string
  meta?: SourceAdapterResult['meta']
}> {
  const fetched = await safeFetch(url)
  if (!fetched.ok) return { articles: [], error: fetched.reason }

  try {
    const feed = await parser.parseString(fetched.text)
    const articles: RawArticle[] = (feed.items || [])
      .slice(0, 40)
      .map((item) => {
        const content = normalizeText(
          item.contentSnippet || item.content || item.summary || item.title || '',
        )
        return {
          canonicalUrl: item.link || item.guid || `${url}#${item.title}`,
          title: normalizeTitle(item.title || 'Untitled'),
          contentText: content,
          publishedAt: normalizePublishedAt(item.isoDate || item.pubDate),
          author: item.creator || item.author,
          sourceTitle: feed.title || sourceTitle,
        }
      })
    const normalized = normalizeArticles(articles)
    return {
      articles: normalized,
      meta: {
        adapter: 'rss',
        fetchedBytes: Buffer.byteLength(fetched.text, 'utf8'),
        itemCount: normalized.length,
      },
    }
  } catch (err) {
    return { articles: [], error: err instanceof Error ? err.message : 'RSS parse failed' }
  }
}

export const rssAdapter: SourceAdapter = {
  id: 'rss',
  kinds: ['rss', 'api'],
  match: (url) => {
    const u = url.toLowerCase()
    return (
      u.includes('/rss') ||
      u.includes('/feed') ||
      u.includes('.xml') ||
      u.includes('atom') ||
      u.includes('rss')
    )
  },
  async fetch(ctx) {
    return fetchRss(ctx.url, ctx.title)
  },
}
