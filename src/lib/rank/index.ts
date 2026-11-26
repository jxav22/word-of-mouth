import type { RawArticle } from '../types'
import { expandKeywords } from './expand'
import { semanticScores, tokenize } from './tfidf'

export type RankPreferences = {
  /** Terms learned from upvotes — soft boost */
  boostTerms?: string[]
  /** Terms learned from downvotes — soft bury */
  buryTerms?: string[]
}

export type ScoredReasons = { score: number; reasons: string[] }

function hoursSince(iso?: string | null): number | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  return (Date.now() - t) / (1000 * 60 * 60)
}

/** Conventional lexical rank: title/body keyword hits + topic + density + freshness. */
export function conventionalScore(
  article: Pick<RawArticle, 'title' | 'contentText'> & { publishedAt?: string | null },
  keywords: string[],
  topics: string[],
  excludeKeywords: string[] = [],
  prefs: RankPreferences = {},
): ScoredReasons {
  const titleTokens = new Set(tokenize(article.title))
  const bodyTokens = tokenize(`${article.title} ${article.contentText}`)
  const bodySet = new Set(bodyTokens)
  const reasons: string[] = []
  let score = 0

  const kw = keywords.map((k) => k.toLowerCase()).filter(Boolean)
  const tp = topics.map((t) => t.toLowerCase()).filter(Boolean)
  const ex = excludeKeywords.map((k) => k.toLowerCase()).filter(Boolean)

  for (const e of ex) {
    const parts = tokenize(e)
    const hit =
      parts.every((p) => titleTokens.has(p) || bodySet.has(p)) ||
      titleTokens.has(e) ||
      bodySet.has(e)
    if (hit) {
      score -= 0.35
      reasons.push(`exclude:${e}`)
    }
  }

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

  if (kw.length && bodyTokens.length) {
    let hits = 0
    for (const token of bodyTokens) {
      if (kw.some((k) => k.includes(token) || token.includes(k))) hits++
    }
    const density = hits / bodyTokens.length
    const bump = Math.min(0.2, density * 4)
    if (bump > 0.02) {
      score += bump
      reasons.push('tf-density')
    }
  }

  const ageH = hoursSince(article.publishedAt)
  if (ageH !== null) {
    if (ageH <= 24) {
      score += 0.08
      reasons.push('fresh:<24h')
    } else if (ageH <= 72) {
      score += 0.04
      reasons.push('fresh:<72h')
    } else if (ageH > 24 * 30) {
      score -= 0.06
      reasons.push('stale')
    }
  } else if (/\b(202[4-6]|today|yesterday|this week)\b/i.test(article.title + article.contentText)) {
    score += 0.04
    reasons.push('recency-signal')
  }

  for (const b of prefs.boostTerms || []) {
    const bl = b.toLowerCase()
    if (titleTokens.has(bl) || bodySet.has(bl) || article.title.toLowerCase().includes(bl)) {
      score += 0.1
      reasons.push(`boost:${bl}`)
    }
  }
  for (const b of prefs.buryTerms || []) {
    const bl = b.toLowerCase()
    if (titleTokens.has(bl) || bodySet.has(bl) || article.title.toLowerCase().includes(bl)) {
      score -= 0.14
      reasons.push(`bury:${bl}`)
    }
  }

  score = Math.max(0, Math.min(1, score))
  if (reasons.length === 0) reasons.push('weak-match')
  return { score, reasons: [...new Set(reasons)].slice(0, 8) }
}

/**
 * Blend conventional lexical score with corpus TF-IDF cosine similarity
 * against the feed query/keywords ("semantic" without an embedding API).
 */
export function scoreArticle(
  article: Pick<RawArticle, 'title' | 'contentText'> & { publishedAt?: string | null },
  keywords: string[],
  topics: string[],
  excludeKeywords: string[] = [],
  prefs: RankPreferences = {},
  semantic = 0,
): ScoredReasons {
  const conv = conventionalScore(article, keywords, topics, excludeKeywords, prefs)
  const blended = Math.max(0, Math.min(1, conv.score * 0.72 + semantic * 0.28))
  const reasons = [...conv.reasons]
  if (semantic >= 0.12) reasons.push(`semantic:${semantic.toFixed(2)}`)
  return {
    score: Math.round(blended * 1000) / 1000,
    reasons: [...new Set(reasons)].slice(0, 8),
  }
}

export function rankArticles<
  T extends Pick<RawArticle, 'title' | 'contentText'> & { publishedAt?: string | null },
>(
  articles: T[],
  keywords: string[],
  topics: string[],
  threshold = 0.15,
  opts?: {
    excludeKeywords?: string[]
    prefs?: RankPreferences
    queryText?: string
  },
): Array<T & { score: number; reasons: string[] }> {
  const excludeKeywords = opts?.excludeKeywords ?? []
  const prefs = opts?.prefs ?? {}
  const expanded = expandKeywords(keywords)
  const queryText =
    opts?.queryText ||
    [...expanded, ...topics].filter(Boolean).join(' ')

  const docs = articles.map((a) => `${a.title}\n${a.contentText}`)
  const sem = queryText.trim() ? semanticScores(queryText, docs) : articles.map(() => 0)

  const ranked = articles
    .map((a, i) => {
      const { score, reasons } = scoreArticle(
        a,
        expanded,
        topics,
        excludeKeywords,
        prefs,
        sem[i] ?? 0,
      )
      const tagged =
        expanded.length > keywords.length
          ? [...reasons, 'expanded-keywords']
          : reasons
      return { ...a, score, reasons: [...new Set(tagged)].slice(0, 8) }
    })
    .filter((a) => a.score >= threshold)
    .sort((a, b) => b.score - a.score)

  return mmrReorder(ranked)
}

/**
 * Soft diversity: after score sort, nudge later members of the same story
 * cluster downward so one event does not monopolise the top of the feed.
 */
export function diversifyByCluster<
  T extends { score: number; clusterId?: string | null },
>(items: T[], penalty = 0.04): T[] {
  const seen = new Map<string, number>()
  return [...items]
    .map((item) => {
      const cid = item.clusterId
      if (!cid) return { ...item }
      const n = seen.get(cid) || 0
      seen.set(cid, n + 1)
      if (n === 0) return { ...item }
      return {
        ...item,
        score: Math.round(Math.max(0, item.score - penalty * n) * 1000) / 1000,
      }
    })
    .sort((a, b) => b.score - a.score)
}

function titleTokens(title: string): Set<string> {
  return new Set(tokenize(title))
}

function jaccardSets(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  const union = a.size + b.size - inter
  return union === 0 ? 0 : inter / union
}

/**
 * Maximal Marginal Relevance reorder: trade a little relevance for title novelty
 * so the top of the feed is less repetitive across near-phrasing.
 */
export function mmrReorder<T extends { title: string; score: number }>(
  items: T[],
  lambda = 0.72,
): T[] {
  if (items.length <= 2) return items
  const remaining = [...items]
  const selected: T[] = []
  const selectedToks: Set<string>[] = []

  while (remaining.length) {
    let bestIdx = 0
    let bestVal = -Infinity
    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i]
      const toks = titleTokens(cand.title)
      let maxSim = 0
      for (const prev of selectedToks) {
        maxSim = Math.max(maxSim, jaccardSets(toks, prev))
      }
      const mmr = lambda * cand.score - (1 - lambda) * maxSim
      if (mmr > bestVal) {
        bestVal = mmr
        bestIdx = i
      }
    }
    const [picked] = remaining.splice(bestIdx, 1)
    selected.push(picked)
    selectedToks.push(titleTokens(picked.title))
  }
  return selected
}

export { tokenize, expandKeywords }
