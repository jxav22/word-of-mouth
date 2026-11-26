import { describe, expect, it } from 'vitest'
import { parseFeedQuery } from '../../src/lib/feeds/parse'

describe('parse API contract shape', () => {
  it('returns fields the /api/feeds/parse route exposes', () => {
    const parsed = parseFeedQuery('Industry intelligence for SaaS startups not crypto')
    expect(parsed).toMatchObject({
      title: expect.any(String),
      keywords: expect.any(Array),
      topics: expect.any(Array),
      excludeKeywords: expect.any(Array),
      intent: expect.any(String),
      relevanceThreshold: expect.any(Number),
      configQuality: expect.any(Number),
      suggestedSources: expect.any(Array),
    })
    expect(parsed.excludeKeywords).toContain('crypto')
    expect(parsed.intent).toBe('industry')
  })
})
