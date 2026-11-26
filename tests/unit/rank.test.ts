import { describe, expect, it } from 'vitest'
import { rankArticles, scoreArticle } from '../../src/lib/rank'

describe('rank', () => {
  it('scores keyword hits in title higher', () => {
    const high = scoreArticle(
      { title: 'Remote TypeScript engineer hiring in Auckland', contentText: 'A role.' },
      ['typescript', 'remote', 'auckland'],
      ['employment'],
    )
    const low = scoreArticle(
      { title: 'Cooking tips for summer', contentText: 'Recipes and salads.' },
      ['typescript', 'remote', 'auckland'],
      ['employment'],
    )
    expect(high.score).toBeGreaterThan(low.score)
    expect(high.reasons.some((r) => r.startsWith('title:'))).toBe(true)
  })

  it('filters below threshold', () => {
    const ranked = rankArticles(
      [
        { title: 'AI infrastructure tooling', contentText: 'llm systems edge' },
        { title: 'Garden mulch guide', contentText: 'soil compost' },
      ],
      ['ai', 'infrastructure', 'llm'],
      ['ai'],
      0.2,
    )
    expect(ranked.length).toBeGreaterThan(0)
    expect(ranked.every((r) => r.score >= 0.2)).toBe(true)
  })
})
