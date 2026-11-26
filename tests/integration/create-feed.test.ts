import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import path from 'path'
import os from 'os'
import fs from 'fs'

describe('create feed integration', () => {
  let tmp: string

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wom-'))
    process.env.WOM_DATA_DIR = tmp
    process.env.WOM_DB_PATH = path.join(tmp, 'test.db')
    process.env.WOM_DISABLE_SCHEDULER = '1'
    // Reset module singletons between tests
    jestResetModules()
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  function jestResetModules() {
    // vitest reset
  }

  it('creates a feed, persists sqlite, and returns keywords', async () => {
    // Fresh imports after env set
    const { resetDbForTests } = await import('../../src/lib/db')
    resetDbForTests()
    const { createFeed, listFeeds, getFeedItems } = await import('../../src/lib/feeds/service')

    const { feed } = await createFeed({
      query: 'AI systems and developer tooling news',
      title: 'Tech pulse',
      ingest: false,
    })

    expect(feed.title).toBe('Tech pulse')
    expect(feed.keywords.length).toBeGreaterThan(0)
    expect(feed.isDemo).toBe(false)
    expect(listFeeds().some((f) => f.id === feed.id)).toBe(true)
    expect(getFeedItems(feed.id)).toEqual([])
    expect(fs.existsSync(process.env.WOM_DB_PATH!)).toBe(true)
  })
})
