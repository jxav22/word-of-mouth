import Parser from 'rss-parser'
import { safeFetch } from '../security/ssrf'
import { stripHtml } from '../security/sanitize'
import type { RawArticle } from '../types'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'WordOfMouthBot/0.1 (+https://github.com/jxav22/word-of-mouth)',
  },
})

export async function fetchRss(url: string, sourceTitle: string): Promise<{
  articles: RawArticle[]
  error?: string
}> {
  const fetched = await safeFetch(url)
  if (!fetched.ok) return { articles: [], error: fetched.reason }

  try {
    const feed = await parser.parseString(fetched.text)
    const articles: RawArticle[] = (feed.items || [])
      .slice(0, 40)
      .map((item) => {
        const content = stripHtml(
          item.contentSnippet || item.content || item.summary || item.title || '',
        )
        return {
          canonicalUrl: item.link || item.guid || `${url}#${item.title}`,
          title: stripHtml(item.title || 'Untitled'),
          contentText: content.slice(0, 5000),
          publishedAt: item.isoDate || item.pubDate,
          author: item.creator || item.author,
          sourceTitle: feed.title || sourceTitle,
        }
      })
      .filter((a) => a.canonicalUrl.startsWith('http'))
    return { articles }
  } catch (err) {
    return { articles: [], error: err instanceof Error ? err.message : 'RSS parse failed' }
  }
}
