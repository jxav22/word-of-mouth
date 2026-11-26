import { describe, expect, it } from 'vitest'

/** Mirrors search page link construction: prefer API feedSlug over id fallback. */
function searchItemHref(item: { feedId: string; feedSlug?: string; articleId: string }) {
  const slug = item.feedSlug || item.feedId
  return `/feeds/${slug}/items/${item.articleId}`
}

describe('search result link slug preference', () => {
  it('uses feedSlug when present', () => {
    expect(
      searchItemHref({
        feedId: 'abc123XYZ',
        feedSlug: 'demo-employment',
        articleId: 'art-1',
      }),
    ).toBe('/feeds/demo-employment/items/art-1')
  })

  it('falls back to feedId only when slug missing', () => {
    expect(
      searchItemHref({
        feedId: 'abc123XYZ',
        articleId: 'art-2',
      }),
    ).toBe('/feeds/abc123XYZ/items/art-2')
  })
})
