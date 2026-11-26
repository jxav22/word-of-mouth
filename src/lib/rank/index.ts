import type { RawArticle } from '../types'

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1)
}

export function scoreArticle(
  article: Pick<RawArticle, 'title' | 'contentText'>,
  keywords: string[],
  topics: string[],
): { score: number; reasons: string[] } {
  const titleTokens = new Set(tokenize(article.title))
  const bodyTokens = tokenize(`${article.title} ${article.contentText}`)
  const bodySet = new Set(bodyTokens)
  const reasons: string[] = []
  let score = 0

  const kw = keywords.map((k) => k.toLowerCase()).filter(Boolean)
  const tp = topics.map((t) => t.toLowerCase()).filter(Boolean)

  for (const k of kw) {
    const parts = tokenize(k)
    const inTitle = parts.every((p) => titleTokens.has(p)) || titleTokens.has(k)
    const inBody = parts.every((p) => bodySet.has(p)) || bodySet.has(k)
    if (inTitle) {
      score += 0.28
      reasons.push(`title:${k}`)
    } else if (inBody) {
      score += 0.12
      reasons.push(`body:${k}`)
    }
  }

  for (const t of tp) {
    if (titleTokens.has(t) || bodySet.has(t)) {
      score += 0.08
      reasons.push(`topic:${t}`)
    }
  }

  // Soft freshness bump if content looks recent in text (best-effort)
  if (/\b(202[4-6]|today|yesterday|this week)\b/i.test(article.title + article.contentText)) {
    score += 0.05
    reasons.push('recency-signal')
  }

  // Density-normalized TF bump for top keywords
  if (kw.length && bodyTokens.length) {
    let hits = 0
    for (const token of bodyTokens) {
      if (kw.some((k) => k.includes(token) || token.includes(k))) hits++
    }
    const density = hits / bodyTokens.length
    score += Math.min(0.2, density * 4)
  }

  score = Math.max(0, Math.min(1, score))
  if (reasons.length === 0) reasons.push('weak-match')
  return { score, reasons: [...new Set(reasons)].slice(0, 6) }
}

export function rankArticles<T extends Pick<RawArticle, 'title' | 'contentText'>>(
  articles: T[],
  keywords: string[],
  topics: string[],
  threshold = 0.15,
): Array<T & { score: number; reasons: string[] }> {
  return articles
    .map((a) => {
      const { score, reasons } = scoreArticle(a, keywords, topics)
      return { ...a, score, reasons }
    })
    .filter((a) => a.score >= threshold)
    .sort((a, b) => b.score - a.score)
}
