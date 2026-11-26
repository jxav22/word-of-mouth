import { describe, expect, it } from 'vitest'
import { dedupeArticles, titleSimilarity } from '../../src/lib/cluster/dedupe'

describe('dedupe', () => {
  it('detects similar titles', () => {
    const sim = titleSimilarity(
      'Open-weight models push smaller teams into production AI',
      'Open weight models push smaller teams into production AI',
    )
    expect(sim).toBeGreaterThan(0.7)
  })

  it('drops exact URL duplicates and near titles', () => {
    const { kept, duplicates } = dedupeArticles([
      { canonicalUrl: 'https://example.com/a', title: 'Remote platform engineer roles trending' },
      { canonicalUrl: 'https://example.com/a/', title: 'Something else' },
      {
        canonicalUrl: 'https://example.com/b',
        title: 'Remote platform engineer roles trending',
      },
      { canonicalUrl: 'https://example.com/c', title: 'Totally different gardening news' },
    ])
    expect(kept.map((k) => k.canonicalUrl)).toEqual([
      'https://example.com/a',
      'https://example.com/c',
    ])
    expect(duplicates.length).toBe(2)
  })
})
