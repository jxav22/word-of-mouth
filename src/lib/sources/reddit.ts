import { safeFetch } from '../security/ssrf'
import { normalizeArticles, normalizeText, normalizeTitle, normalizePublishedAt } from '../ingest/normalize'
import { fetchRss } from './rss'
import type { RawArticle } from '../types'
import type { SourceAdapter } from './types'

type RedditChild = {
  data?: {
    id?: string
    title?: string
    url?: string
    permalink?: string
    selftext?: string
    author?: string
    created_utc?: number
    subreddit?: string
    is_self?: boolean
    stickied?: boolean
  }
}

type RedditListing = {
  data?: {
    children?: RedditChild[]
  }
}

const REDDIT_UA =
  'web:word-of-mouth:0.1.0 (by /u/wordofmouth_bot; +https://github.com/jxav22/word-of-mouth)'

function subredditFromInput(input: string): string | null {
  const trimmed = input.trim()
  if (/^\/?r\//i.test(trimmed) || (!trimmed.includes('.') && !trimmed.includes('://'))) {
    return trimmed.replace(/^\/?(r\/)?/i, '').split(/[/?#]/)[0] || null
  }
  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    const m = url.pathname.match(/\/r\/([^/]+)/i)
    return m?.[1] || null
  } catch {
    return null
  }
}

/** Prefer public subreddit RSS (more reliable than .json which often 403s). */
export function redditRssUrl(input: string): string {
  const sub = subredditFromInput(input) || 'programming'
  // `/r/{sub}.rss` (no slash) is the form that still returns Atom today
  return `https://www.reddit.com/r/${encodeURIComponent(sub)}.rss`
}

/** Alternate classic path — try when the primary form fails. */
export function redditRssUrlAlt(input: string): string {
  const sub = subredditFromInput(input) || 'programming'
  return `https://www.reddit.com/r/${encodeURIComponent(sub)}/.rss`
}

/** Build a Reddit public JSON listing URL from a subreddit name or full URL. */
export function redditListingUrl(input: string): string {
  const trimmed = input.trim()
  if (trimmed.includes('reddit.com') && trimmed.includes('.json')) {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    url.hostname = 'www.reddit.com'
    url.searchParams.set('limit', url.searchParams.get('limit') || '25')
    url.searchParams.set('raw_json', '1')
    return url.toString()
  }
  const sub = subredditFromInput(trimmed) || 'programming'
  return `https://www.reddit.com/r/${encodeURIComponent(sub)}/new.json?limit=25&raw_json=1`
}

function parseRedditJson(
  text: string,
  sourceTitle: string,
): {
  articles: RawArticle[]
  error?: string
  meta?: { adapter: string; fetchedBytes?: number; itemCount?: number }
} {
  try {
    const data = JSON.parse(text) as RedditListing
    const children = data.data?.children || []
    const articles: RawArticle[] = children
      .map((child) => child.data)
      .filter((d): d is NonNullable<RedditChild['data']> => Boolean(d) && !d!.stickied)
      .map((post) => {
        const permalink = post.permalink
          ? `https://www.reddit.com${post.permalink}`
          : post.id
            ? `https://www.reddit.com/comments/${post.id}`
            : ''
        const canonicalUrl = post.is_self || !post.url ? permalink : post.url || permalink
        const content = normalizeText(post.selftext || post.title || '')
        return {
          canonicalUrl,
          title: normalizeTitle(post.title || 'Untitled'),
          contentText: content,
          publishedAt: post.created_utc
            ? normalizePublishedAt(new Date(post.created_utc * 1000).toISOString())
            : undefined,
          author: post.author,
          sourceTitle: post.subreddit ? `r/${post.subreddit}` : sourceTitle,
        }
      })
    const normalized = normalizeArticles(articles)
    return {
      articles: normalized,
      meta: {
        adapter: 'reddit',
        fetchedBytes: Buffer.byteLength(text, 'utf8'),
        itemCount: normalized.length,
      },
    }
  } catch (err) {
    return { articles: [], error: err instanceof Error ? err.message : 'Reddit parse failed' }
  }
}

export async function fetchReddit(url: string, sourceTitle: string): Promise<{
  articles: RawArticle[]
  error?: string
  meta?: { adapter: string; fetchedBytes?: number; itemCount?: number }
}> {
  // Reddit often answers RSS with HTTP 404 + a valid Atom body — accept 404 when feed-shaped.
  const rssOpts = { acceptStatuses: [404] }
  const rssCandidates = [redditRssUrl(url), redditRssUrlAlt(url)]
  let lastRssError: string | undefined

  for (const candidate of rssCandidates) {
    const rss = await fetchRss(candidate, sourceTitle, rssOpts)
    if (!rss.error && rss.articles.length > 0) {
      return {
        articles: rss.articles.map((a) => ({
          ...a,
          sourceTitle: a.sourceTitle || sourceTitle,
        })),
        meta: { adapter: 'reddit', itemCount: rss.articles.length, ...rss.meta },
      }
    }
    lastRssError = rss.error || 'empty feed'
  }

  // JSON listing fallback
  const listingUrl = redditListingUrl(url)
  const fetched = await safeFetch(listingUrl, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'User-Agent': REDDIT_UA,
    },
  })
  if (fetched.ok) return parseRedditJson(fetched.text, sourceTitle)

  return {
    articles: [],
    error: lastRssError
      ? `rss: ${lastRssError}; json: ${fetched.reason}`
      : fetched.reason,
  }
}

export const redditAdapter: SourceAdapter = {
  id: 'reddit',
  kinds: ['reddit'],
  match: (url) => /reddit\.com/i.test(url) || /^\/?r\//i.test(url),
  async fetch(ctx) {
    return fetchReddit(ctx.url, ctx.title)
  },
}
