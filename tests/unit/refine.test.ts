import { describe, expect, it } from 'vitest'
import { refineFromFeedback, extractFeedbackTerms, prefsFromFeedbackHistory } from '../../src/lib/feeds/refine'

describe('feedback refine', () => {
  it('extracts distinctive title terms', () => {
    const terms = extractFeedbackTerms(
      'Kubernetes observability platform raises series A',
      'The startup builds tracing and metrics for cloud native teams.',
      ['startup'],
    )
    expect(terms.length).toBeGreaterThan(0)
    expect(terms).not.toContain('startup')
  })

  it('up-vote learns keywords and eases threshold', () => {
    const result = refineFromFeedback({
      keywords: ['ai', 'tools'],
      excludeKeywords: [],
      relevanceThreshold: 0.2,
      vote: 'up',
      articleTitle: 'Open source LLM evaluation harness ships',
      articleContent: 'Developers use the harness to benchmark models.',
    })
    expect(result.relevanceThreshold).toBeLessThan(0.2)
    expect(result.boostTerms.length).toBeGreaterThan(0)
    expect(result.keywords.length).toBeGreaterThanOrEqual(2)
    expect(result.changes.some((c) => c.startsWith('threshold:') || c.startsWith('+keyword:'))).toBe(
      true,
    )
  })

  it('down-vote adds excludes and tightens threshold', () => {
    const result = refineFromFeedback({
      keywords: ['tech', 'news', 'gadgets'],
      excludeKeywords: [],
      relevanceThreshold: 0.15,
      vote: 'down',
      articleTitle: 'Celebrity crypto token launch party',
      articleContent: 'Influencers promote a meme coin overnight.',
    })
    expect(result.relevanceThreshold).toBeGreaterThan(0.15)
    expect(result.excludeKeywords.length).toBeGreaterThan(0)
    expect(result.buryTerms.length).toBeGreaterThan(0)
  })

  it('aggregates prefs from history', () => {
    const prefs = prefsFromFeedbackHistory([
      {
        feedback: 'up',
        title: 'Rust async runtime improvements',
        contentText: 'Tokio and async traits get faster.',
      },
      {
        feedback: 'down',
        title: 'Football transfer rumours today',
        contentText: 'Premier league gossip continues.',
      },
    ])
    expect(prefs.boostTerms.length).toBeGreaterThan(0)
    expect(prefs.buryTerms.length).toBeGreaterThan(0)
  })
})
