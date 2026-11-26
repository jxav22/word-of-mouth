import { describe, expect, it } from 'vitest'
import { listAdapters, resolveAdapter } from '../../src/lib/sources/registry'
import { redditListingUrl } from '../../src/lib/sources/reddit'

describe('source registry', () => {
  it('lists built-in adapters', () => {
    const ids = listAdapters().map((a) => a.id)
    expect(ids).toEqual(expect.arrayContaining(['rss', 'hn', 'reddit', 'json-api', 'demo']))
  })

  it('resolves by kind and URL hints', () => {
    expect(resolveAdapter('hn', 'https://hn.algolia.com/api/v1/search?query=x')?.id).toBe('hn')
    expect(resolveAdapter('reddit', 'https://www.reddit.com/r/programming/new.json')?.id).toBe(
      'reddit',
    )
    expect(resolveAdapter('rss', 'https://www.theverge.com/rss/index.xml')?.id).toBe('rss')
    expect(resolveAdapter('api', 'https://example.com/api/items.json')?.id).toBe('json-api')
    expect(resolveAdapter('demo', 'demo://x')?.id).toBe('demo')
  })

  it('normalises reddit listing URLs', () => {
    expect(redditListingUrl('programming')).toContain('reddit.com/r/programming')
    expect(redditListingUrl('https://www.reddit.com/r/ai/')).toContain('.json')
  })
})
