import { tokenize } from '../rank/tfidf'

const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'at', 'from', 'with',
  'is', 'are', 'was', 'were', 'be', 'this', 'that', 'as', 'by', 'it', 'its', 'news',
])

/** Pull distinctive terms from an article title/body for feedback learning. */
export function extractFeedbackTerms(
  title: string,
  contentText: string,
  existingKeywords: string[] = [],
  limit = 5,
): string[] {
  const existing = new Set(existingKeywords.map((k) => k.toLowerCase()))
  const titleToks = tokenize(title).filter((t) => t.length > 3 && !STOP.has(t))
  const bodyToks = tokenize(contentText.slice(0, 800))
  const freq = new Map<string, number>()
  for (const t of titleToks) freq.set(t, (freq.get(t) || 0) + 3)
  for (const t of bodyToks) {
    if (t.length > 3 && !STOP.has(t)) freq.set(t, (freq.get(t) || 0) + 1)
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t)
    .filter((t) => !existing.has(t))
    .slice(0, limit)
}

export type RefineInput = {
  keywords: string[]
  excludeKeywords: string[]
  relevanceThreshold: number
  vote: 'up' | 'down' | null
  articleTitle: string
  articleContent: string
}

export type RefineResult = {
  keywords: string[]
  excludeKeywords: string[]
  relevanceThreshold: number
  boostTerms: string[]
  buryTerms: string[]
  changes: string[]
}

/**
 * Feedback-driven feed config refinement.
 * Up → learn terms + ease threshold slightly.
 * Down → exclude noisy terms + tighten threshold.
 * Null → no-op on config (caller still clears vote).
 */
export function refineFromFeedback(input: RefineInput): RefineResult {
  const changes: string[] = []
  let keywords = [...input.keywords]
  let excludeKeywords = [...input.excludeKeywords]
  let relevanceThreshold = input.relevanceThreshold
  let boostTerms: string[] = []
  let buryTerms: string[] = []

  if (input.vote === null) {
    return {
      keywords,
      excludeKeywords,
      relevanceThreshold,
      boostTerms,
      buryTerms,
      changes: ['cleared-vote'],
    }
  }

  const terms = extractFeedbackTerms(input.articleTitle, input.articleContent, keywords)

  if (input.vote === 'up') {
    boostTerms = terms.slice(0, 4)
    for (const t of boostTerms) {
      if (!keywords.includes(t) && keywords.length < 20) {
        keywords.push(t)
        changes.push(`+keyword:${t}`)
      }
    }
    // Drop from excludes if user later likes related content
    const before = excludeKeywords.length
    excludeKeywords = excludeKeywords.filter((e) => !boostTerms.includes(e))
    if (excludeKeywords.length !== before) changes.push('unexclude-overlap')
    const next = Math.max(0.05, relevanceThreshold - 0.015)
    if (next !== relevanceThreshold) {
      relevanceThreshold = Math.round(next * 1000) / 1000
      changes.push(`threshold:${relevanceThreshold}`)
    }
  }

  if (input.vote === 'down') {
    buryTerms = terms.slice(0, 4)
    for (const t of buryTerms) {
      if (!excludeKeywords.includes(t) && excludeKeywords.length < 16) {
        excludeKeywords.push(t)
        changes.push(`+exclude:${t}`)
      }
      // Soft-remove exact keyword matches that drove a bad item
      if (keywords.includes(t) && keywords.length > 3) {
        keywords = keywords.filter((k) => k !== t)
        changes.push(`-keyword:${t}`)
      }
    }
    const next = Math.min(0.55, relevanceThreshold + 0.025)
    if (next !== relevanceThreshold) {
      relevanceThreshold = Math.round(next * 1000) / 1000
      changes.push(`threshold:${relevanceThreshold}`)
    }
  }

  if (changes.length === 0) changes.push('no-config-change')
  return {
    keywords: [...new Set(keywords)].slice(0, 20),
    excludeKeywords: [...new Set(excludeKeywords)].slice(0, 16),
    relevanceThreshold,
    boostTerms,
    buryTerms,
    changes,
  }
}

/** Aggregate boost/bury terms from stored feedback rows + article text. */
export function prefsFromFeedbackHistory(
  rows: Array<{ feedback: string | null; title: string; contentText: string }>,
): { boostTerms: string[]; buryTerms: string[] } {
  const boost = new Map<string, number>()
  const bury = new Map<string, number>()
  for (const row of rows) {
    if (row.feedback !== 'up' && row.feedback !== 'down') continue
    const terms = extractFeedbackTerms(row.title, row.contentText, [], 4)
    const target = row.feedback === 'up' ? boost : bury
    for (const t of terms) target.set(t, (target.get(t) || 0) + 1)
  }
  const top = (m: Map<string, number>) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
      .slice(0, 8)
  return { boostTerms: top(boost), buryTerms: top(bury) }
}
