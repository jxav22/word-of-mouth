import { describe, expect, it } from 'vitest'
import { parseFeedQuery, computeRelevanceThreshold, scoreConfigQuality } from '../../src/lib/feeds/parse'

describe('parseFeedQuery', () => {
  it('keeps short AI keyword and infers topics', () => {
    const parsed = parseFeedQuery('Latest AI systems and developer tooling news')
    expect(parsed.keywords).toContain('ai')
    expect(parsed.topics).toContain('ai')
    expect(parsed.suggestedSources.length).toBeGreaterThan(0)
  })

  it('detects NZ employment intent', () => {
    const parsed = parseFeedQuery('Software engineering jobs in New Zealand and remote roles')
    expect(parsed.topics).toEqual(expect.arrayContaining(['employment', 'nz']))
    expect(parsed.keywords).toEqual(expect.arrayContaining(['new zealand']))
    expect(parsed.intent).toBe('employment')
  })

  it('extracts phrases, topics, intent and quality for employment NZ query', () => {
    const parsed = parseFeedQuery(
      'Remote software engineer jobs in Auckland New Zealand -crypto',
    )
    expect(parsed.intent).toBe('employment')
    expect(parsed.topics).toContain('employment')
    expect(parsed.topics).toContain('nz')
    expect(parsed.keywords.some((k) => k.includes('auckland') || k.includes('software'))).toBe(true)
    expect(parsed.excludeKeywords).toContain('crypto')
    expect(parsed.configQuality).toBeGreaterThan(0.4)
    expect(parsed.suggestedSources.length).toBeGreaterThanOrEqual(2)
    expect(parsed.relevanceThreshold).toBeGreaterThan(0.1)
  })

  it('parses quoted phrases and not-exclusions', () => {
    const parsed = parseFeedQuery('updates about "machine learning" not blockchain')
    expect(parsed.keywords).toContain('machine learning')
    expect(parsed.excludeKeywords).toContain('blockchain')
    expect(parsed.topics).toContain('ai')
  })

  it('scores specific configs higher than vague ones', () => {
    const specific = parseFeedQuery('AI LLM infrastructure observability devops for startups')
    const vague = parseFeedQuery('stuff happening')
    expect(specific.configQuality).toBeGreaterThan(vague.configQuality)
  })

  it('raises threshold with specificity', () => {
    const low = computeRelevanceThreshold(['news'], ['general'], 'general')
    const high = computeRelevanceThreshold(
      ['typescript', 'remote', 'auckland', 'engineer', 'hiring'],
      ['employment', 'nz', 'remote'],
      'employment',
    )
    expect(high).toBeGreaterThan(low)
  })

  it('scoreConfigQuality rewards phrases and sources', () => {
    const q = scoreConfigQuality({
      keywords: ['machine learning', 'llm', 'infra'],
      topics: ['ai'],
      excludeKeywords: ['crypto'],
      intent: 'technology',
      suggestedSources: [{}, {}, {}],
    })
    expect(q).toBeGreaterThan(0.5)
  })
})
