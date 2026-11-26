import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import path from 'path'
import os from 'os'
import fs from 'fs'

describe('feedback + share integration', () => {
  let tmp: string

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wom-'))
    process.env.WOM_DATA_DIR = tmp
    process.env.WOM_DB_PATH = path.join(tmp, 'test.db')
    process.env.WOM_DISABLE_SCHEDULER = '1'
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it('seeds demos, shares, searches, and adjusts threshold on feedback', async () => {
    const { resetDbForTests } = await import('../../src/lib/db')
    resetDbForTests()
    const {
      seedDemoFeeds,
      ensureShareToken,
      getFeedByShareToken,
      getFeedItems,
      searchAll,
      setFeedback,
      getFeedByIdOrSlug,
    } = await import('../../src/lib/feeds/service')

    const feeds = await seedDemoFeeds(false)
    expect(feeds.length).toBeGreaterThanOrEqual(4)
    expect(feeds.every((f) => f.isDemo)).toBe(true)

    const feed = feeds[0]!
    const token = ensureShareToken(feed.id)
    expect(token.length).toBeGreaterThan(5)
    expect(getFeedByShareToken(token)?.id).toBe(feed.id)

    const items = getFeedItems(feed.id)
    expect(items.length).toBeGreaterThan(0)

    const needle = items[0]!.article.title.split(' ')[0]!
    const hits = searchAll(needle, feed.id)
    expect(hits.length).toBeGreaterThan(0)

    const before = getFeedByIdOrSlug(feed.id)!.relevanceThreshold
    const targetId = items[0]!.id
    setFeedback(feed.id, targetId, 'down')
    const after = getFeedByIdOrSlug(feed.id)!.relevanceThreshold
    expect(after).toBeGreaterThan(before)
    // Re-rank may reorder; assert by id rather than list position
    expect(getFeedItems(feed.id).find((i) => i.id === targetId)?.feedback).toBe('down')
  })
})
