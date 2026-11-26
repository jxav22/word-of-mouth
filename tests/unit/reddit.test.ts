import { describe, expect, it } from 'vitest'
import { redditListingUrl, redditRssUrl } from '@/lib/sources/reddit'

describe('reddit URL helpers', () => {
  it('builds public RSS URL from subreddit slug', () => {
    expect(redditRssUrl('MachineLearning')).toBe(
      'https://www.reddit.com/r/MachineLearning/.rss',
    )
  })

  it('builds JSON listing fallback that Reddit often 403s', () => {
    expect(redditListingUrl('r/cscareerquestions')).toBe(
      'https://www.reddit.com/r/cscareerquestions/new.json?limit=25&raw_json=1',
    )
  })

  it('normalizes full reddit.com paths', () => {
    expect(redditRssUrl('https://www.reddit.com/r/startups/')).toBe(
      'https://www.reddit.com/r/startups/.rss',
    )
  })
})
