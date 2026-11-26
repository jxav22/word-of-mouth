import { describe, expect, it } from 'vitest'

// Pure due-check logic mirrored for unit coverage without DB.
function isDue(
  feed: { updatedAt: string; refreshIntervalMin: number; isDemo: boolean },
  now: number,
  refreshDemo = false,
): boolean {
  if (feed.isDemo && !refreshDemo) return false
  const intervalMs = Math.max(5, feed.refreshIntervalMin || 30) * 60_000
  const updated = Date.parse(feed.updatedAt)
  if (!Number.isFinite(updated)) return true
  return now - updated >= intervalMs
}

describe('scheduler due logic', () => {
  const now = Date.parse('2026-11-26T16:00:00.000Z')

  it('skips demo feeds unless enabled', () => {
    expect(
      isDue({ updatedAt: '2026-11-26T10:00:00.000Z', refreshIntervalMin: 30, isDemo: true }, now),
    ).toBe(false)
    expect(
      isDue(
        { updatedAt: '2026-11-26T10:00:00.000Z', refreshIntervalMin: 30, isDemo: true },
        now,
        true,
      ),
    ).toBe(true)
  })

  it('respects refresh interval', () => {
    expect(
      isDue(
        { updatedAt: '2026-11-26T15:45:00.000Z', refreshIntervalMin: 30, isDemo: false },
        now,
      ),
    ).toBe(false)
    expect(
      isDue(
        { updatedAt: '2026-11-26T15:20:00.000Z', refreshIntervalMin: 30, isDemo: false },
        now,
      ),
    ).toBe(true)
  })
})
