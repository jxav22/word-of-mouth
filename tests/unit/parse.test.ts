import { describe, expect, it } from 'vitest'
import { parseFeedQuery } from '../../src/lib/feeds/parse'

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
  })
})
