import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import path from 'path'
import os from 'os'
import fs from 'fs'

describe('feedback refine integration', () => {
  let tmp: string

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wom-fb-'))
    process.env.WOM_DATA_DIR = tmp
    process.env.WOM_DB_PATH = path.join(tmp, 'test.db')
    process.env.WOM_DISABLE_SCHEDULER = '1'
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it('down-vote updates excludes, threshold, and re-ranks', async () => {
    const { resetDbForTests } = await import('../../src/lib/db')
    resetDbForTests()
    const { createFeed, getFeedItems, setFeedback, getFeedByIdOrSlug } = await import(
      '../../src/lib/feeds/service'
    )
    const { seedDemoFeeds } = await import('../../src/lib/feeds/service')

    const feeds = await seedDemoFeeds(true)
    const feed = feeds[0]
    const items = getFeedItems(feed.id)
    expect(items.length).toBeGreaterThan(0)

    const before = getFeedByIdOrSlug(feed.id)!
    const result = setFeedback(feed.id, items[0].id, 'down')
    expect(result.refined.excludeKeywords.length + result.refined.changes.length).toBeGreaterThan(0)
    expect(result.reranked).toBeGreaterThan(0)

    const after = getFeedByIdOrSlug(feed.id)!
    expect(after.relevanceThreshold).toBeGreaterThanOrEqual(before.relevanceThreshold)
  })

  it('createFeed persists exclude keywords from NL', async () => {
    const { resetDbForTests } = await import('../../src/lib/db')
    resetDbForTests()
    const { createFeed } = await import('../../src/lib/feeds/service')
    const { feed, configQuality, intent } = await createFeed({
      query: 'AI developer tooling news not crypto',
      title: 'Tooling',
      ingest: false,
    })
    expect(feed.excludeKeywords).toContain('crypto')
    expect(configQuality).toBeGreaterThan(0.3)
    expect(intent).toBeTruthy()
  })
})
