import { safeFetch } from '../security/ssrf'
import { normalizeArticles, normalizeText, normalizeTitle, normalizePublishedAt } from '../ingest/normalize'
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

/** Build a Reddit public JSON listing URL from a subreddit name or full URL. */
export function redditListingUrl(input: string): string {
  const trimmed = input.trim()
  if (trimmed.includes('reddit.com')) {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    // Prefer .json ending
    if (!url.pathname.endsWith('.json')) {
      url.pathname = url.pathname.replace(/\/?$/, '') + '.json'
    }
    url.searchParams.set('limit', url.searchParams.get('limit') || '25')
    url.searchParams.set('raw_json', '1')
    return url.toString()
  }
  const sub = trimmed.replace(/^\/?(r\/)?/i, '').split(/[/?#]/)[0]
  return `https://www.reddit.com/r/${encodeURIComponent(sub)}/new.json?limit=25&raw_json=1`
}

export async function fetchReddit(url: string, sourceTitle: string): Promise<{
  articles: RawArticle[]
  error?: string
  meta?: { adapter: string; fetchedBytes?: number; itemCount?: number }
}> {
  const listingUrl = redditListingUrl(url)
  const fetched = await safeFetch(listingUrl, {
    headers: {
      Accept: 'application/json',
    },
  })
  if (!fetched.ok) return { articles: [], error: fetched.reason }

  try {
    const data = JSON.parse(fetched.text) as RedditListing
    const children = data.data?.children || []
    const articles: RawArticle[] = children
      .map((child) => child.data)
      .filter((d): d is NonNullable<typeof d> => Boolean(d) && !d.stickied)
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
        fetchedBytes: Buffer.byteLength(fetched.text, 'utf8'),
        itemCount: normalized.length,
      },
    }
  } catch (err) {
    return { articles: [], error: err instanceof Error ? err.message : 'Reddit parse failed' }
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
