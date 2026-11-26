import { stripHtml } from '../security/sanitize'
import type { RawArticle } from '../types'

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'ref_src',
  'source',
])

/** Canonicalise article URLs: strip hash/tracking, lowercase host, drop trailing slash (non-root). */
export function canonicalizeUrl(raw: string): string | null {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null

  url.hash = ''
  url.username = ''
  url.password = ''
  url.hostname = url.hostname.toLowerCase()

  const keys = [...url.searchParams.keys()]
  for (const key of keys) {
    if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
      url.searchParams.delete(key)
    }
  }

  let href = url.toString()
  if (href.endsWith('/') && url.pathname !== '/' && !url.search) {
    href = href.slice(0, -1)
  }
  return href
}

export function normalizePublishedAt(raw?: string | null): string | undefined {
  if (!raw) return undefined
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

export function normalizeText(raw: string, max = 5000): string {
  return stripHtml(raw).slice(0, max)
}

export function normalizeTitle(raw: string): string {
  const title = normalizeText(raw, 300)
  return title || 'Untitled'
}

/** Deduplicate by canonical URL within a batch; keep first occurrence. */
export function normalizeArticles(articles: RawArticle[]): RawArticle[] {
  const seen = new Set<string>()
  const out: RawArticle[] = []
  for (const article of articles) {
    const canonicalUrl = canonicalizeUrl(article.canonicalUrl)
    if (!canonicalUrl) continue
    if (seen.has(canonicalUrl)) continue
    seen.add(canonicalUrl)
    out.push({
      ...article,
      canonicalUrl,
      title: normalizeTitle(article.title),
      contentText: normalizeText(article.contentText),
      publishedAt: normalizePublishedAt(article.publishedAt),
      author: article.author ? normalizeText(article.author, 200) : undefined,
      sourceTitle: normalizeText(article.sourceTitle || 'Unknown', 200),
    })
  }
  return out
}
