import { describe, expect, it } from 'vitest'
import { conventionalScore, diversifyByCluster, rankArticles, scoreArticle } from '../../src/lib/rank'

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

  it('penalises exclude keywords', () => {
    const hit = conventionalScore(
      { title: 'Crypto casino promotion', contentText: 'tokens and gambling' },
      ['tech'],
      ['general'],
      ['crypto'],
    )
    const clean = conventionalScore(
      { title: 'Developer tooling release', contentText: 'CLI improvements' },
      ['tech', 'developer', 'tooling'],
      ['general'],
      ['crypto'],
    )
    expect(clean.score).toBeGreaterThan(hit.score)
    expect(hit.reasons.some((r) => r.startsWith('exclude:'))).toBe(true)
  })

  it('applies feedback boost and bury prefs', () => {
    const boosted = conventionalScore(
      { title: 'Rust async runtime notes', contentText: 'performance' },
      ['software'],
      ['technology'],
      [],
      { boostTerms: ['rust'], buryTerms: [] },
    )
    const buried = conventionalScore(
      { title: 'Rust async runtime notes', contentText: 'performance' },
      ['software'],
      ['technology'],
      [],
      { boostTerms: [], buryTerms: ['rust'] },
    )
    expect(boosted.score).toBeGreaterThan(buried.score)
  })

  it('diversifies later cluster members', () => {
    const out = diversifyByCluster([
      { score: 0.9, clusterId: 'c1', id: 'a' },
      { score: 0.88, clusterId: 'c1', id: 'b' },
      { score: 0.7, clusterId: 'c2', id: 'c' },
    ])
    expect(out[0].id).toBe('a')
    expect(out.find((x) => x.id === 'b')!.score).toBeLessThan(0.88)
  })

  it('blends semantic similarity into ranking', () => {
    const ranked = rankArticles(
      [
        {
          title: 'Distributed tracing with OpenTelemetry',
          contentText: 'Spans metrics logs kubernetes kubernetes kubernetes',
          publishedAt: new Date().toISOString(),
        },
        {
          title: 'Banana bread recipe',
          contentText: 'Flour sugar eggs bake oven',
          publishedAt: new Date().toISOString(),
        },
      ],
      ['observability', 'tracing'],
      ['infrastructure'],
      0.05,
      { queryText: 'kubernetes observability tracing opentelemetry' },
    )
    expect(ranked[0].title.toLowerCase()).toContain('tracing')
    expect(ranked[0].reasons.some((r) => r.startsWith('semantic:') || r.startsWith('title:') || r.startsWith('body:'))).toBe(true)
  })
})
