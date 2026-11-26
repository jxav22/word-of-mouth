import { safeFetch } from '../security/ssrf'
import { stripHtml } from '../security/sanitize'
import type { RawArticle } from '../types'

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
}> {
  const fetched = await safeFetch(apiUrl)
  if (!fetched.ok) return { articles: [], error: fetched.reason }

  try {
    const data = JSON.parse(fetched.text) as { hits?: HnHit[] }
    const articles: RawArticle[] = (data.hits || [])
      .map((hit) => {
        const title = stripHtml(hit.title || hit.story_title || 'Untitled')
        const url =
          hit.url ||
          hit.story_url ||
          (hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : '')
        const content = stripHtml(hit.story_text || hit.comment_text || title)
        return {
          canonicalUrl: url,
          title,
          contentText: content.slice(0, 5000),
          publishedAt: hit.created_at,
          author: hit.author,
          sourceTitle: 'Hacker News',
        }
      })
      .filter((a) => a.canonicalUrl.startsWith('http'))
    return { articles }
  } catch (err) {
    return { articles: [], error: err instanceof Error ? err.message : 'HN parse failed' }
  }
}
