import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import path from 'path'
import os from 'os'
import fs from 'fs'

describe('search results include feedSlug', () => {
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

  it('returns feedSlug matching the feed for every hit', async () => {
    const { resetDbForTests } = await import('../../src/lib/db')
    resetDbForTests()
    const { seedDemoFeeds, searchAll, getFeedByIdOrSlug } = await import(
      '../../src/lib/feeds/service'
    )

    const feeds = await seedDemoFeeds(false)
    expect(feeds.length).toBeGreaterThanOrEqual(1)

    const employment = feeds.find((f) => f.slug === 'demo-employment') || feeds[0]!
    const hits = searchAll('hiring', employment.id)
    expect(hits.length).toBeGreaterThan(0)

    for (const hit of hits) {
      expect(hit.feedSlug).toBe(employment.slug)
      expect(hit.feedSlug).not.toBe(hit.feedId)
      expect(hit.feedSlug).toMatch(/^[a-z0-9-]+$/)
      // Slug resolves to same feed as id
      expect(getFeedByIdOrSlug(hit.feedSlug!)?.id).toBe(hit.feedId)
    }
  })

  it('search across all feeds still stamps per-feed slug', async () => {
    const { resetDbForTests } = await import('../../src/lib/db')
    resetDbForTests()
    const { seedDemoFeeds, searchAll } = await import('../../src/lib/feeds/service')
    await seedDemoFeeds(false)

    const hits = searchAll('AI')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.every((h) => typeof h.feedSlug === 'string' && h.feedSlug.length > 0)).toBe(true)
    expect(hits.every((h) => h.feedSlug !== h.feedId)).toBe(true)
  })
})
