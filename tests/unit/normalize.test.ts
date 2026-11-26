import { describe, expect, it } from 'vitest'
import { canonicalizeUrl, normalizeArticles } from '../../src/lib/ingest/normalize'

describe('normalize', () => {
  it('strips tracking params and hashes', () => {
    expect(canonicalizeUrl('https://Example.com/Path/?utm_source=x&id=1#frag')).toBe(
      'https://example.com/Path/?id=1',
    )
  })

  it('dedupes and drops invalid URLs', () => {
    const articles = normalizeArticles([
      {
        canonicalUrl: 'https://example.com/a?utm_campaign=1',
        title: '  Hello ',
        contentText: '<b>World</b>',
        sourceTitle: 'Test',
      },
      {
        canonicalUrl: 'https://example.com/a',
        title: 'Dup',
        contentText: 'x',
        sourceTitle: 'Test',
      },
      {
        canonicalUrl: 'not-a-url',
        title: 'Bad',
        contentText: 'x',
        sourceTitle: 'Test',
      },
    ])
    expect(articles).toHaveLength(1)
    expect(articles[0].canonicalUrl).toBe('https://example.com/a')
    expect(articles[0].title).toBe('Hello')
    expect(articles[0].contentText).toBe('World')
  })
})
