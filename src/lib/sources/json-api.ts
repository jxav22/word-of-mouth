import { safeFetch } from '../security/ssrf'
import { normalizeArticles, normalizeText, normalizeTitle, normalizePublishedAt } from '../ingest/normalize'
import type { RawArticle } from '../types'
import type { SourceAdapter } from './types'

type LooseRecord = Record<string, unknown>

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

function pickString(obj: LooseRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const val = asString(obj[key])
    if (val) return val
  }
  return undefined
}

function extractArray(data: unknown): LooseRecord[] {
  if (Array.isArray(data)) return data.filter((x): x is LooseRecord => Boolean(x) && typeof x === 'object')
  if (data && typeof data === 'object') {
    const obj = data as LooseRecord
    for (const key of ['items', 'results', 'hits', 'articles', 'entries', 'data', 'posts']) {
      const candidate = obj[key]
      if (Array.isArray(candidate)) {
        return candidate.filter((x): x is LooseRecord => Boolean(x) && typeof x === 'object')
      }
      if (candidate && typeof candidate === 'object') {
        const nested = candidate as LooseRecord
        if (Array.isArray(nested.children)) {
          return nested.children
            .map((c) => (c && typeof c === 'object' ? ((c as LooseRecord).data as LooseRecord) || (c as LooseRecord) : null))
            .filter((x): x is LooseRecord => Boolean(x))
        }
        if (Array.isArray(nested.items)) {
          return nested.items.filter((x): x is LooseRecord => Boolean(x) && typeof x === 'object')
        }
      }
    }
  }
  return []
}

/** Generic public JSON API → RawArticle mapper for extensible `api` sources. */
export async function fetchJsonApi(url: string, sourceTitle: string): Promise<{
  articles: RawArticle[]
  error?: string
  meta?: { adapter: string; fetchedBytes?: number; itemCount?: number }
}> {
  const fetched = await safeFetch(url, {
    headers: { Accept: 'application/json, text/json, */*' },
  })
  if (!fetched.ok) return { articles: [], error: fetched.reason }

  try {
    const data = JSON.parse(fetched.text) as unknown
    const rows = extractArray(data).slice(0, 40)
    const articles: RawArticle[] = rows.map((row) => {
      const title = normalizeTitle(
        pickString(row, ['title', 'name', 'headline', 'story_title']) || 'Untitled',
      )
      const link =
        pickString(row, ['url', 'link', 'canonicalUrl', 'canonical_url', 'permalink', 'href', 'story_url']) ||
        ''
      const content = normalizeText(
        pickString(row, [
          'content',
          'contentText',
          'content_text',
          'summary',
          'description',
          'body',
          'selftext',
          'story_text',
          'excerpt',
        ]) || title,
      )
      const publishedAt = normalizePublishedAt(
        pickString(row, ['publishedAt', 'published_at', 'pubDate', 'created_at', 'date', 'createdAt']),
      )
      const author = pickString(row, ['author', 'creator', 'by'])
      return {
        canonicalUrl: link,
        title,
        contentText: content,
        publishedAt,
        author,
        sourceTitle,
      }
    })
    const normalized = normalizeArticles(articles)
    return {
      articles: normalized,
      meta: {
        adapter: 'json-api',
        fetchedBytes: Buffer.byteLength(fetched.text, 'utf8'),
        itemCount: normalized.length,
      },
    }
  } catch (err) {
    return { articles: [], error: err instanceof Error ? err.message : 'JSON API parse failed' }
  }
}

export const jsonApiAdapter: SourceAdapter = {
  id: 'json-api',
  kinds: ['api'],
  async fetch(ctx) {
    return fetchJsonApi(ctx.url, ctx.title)
  },
}
