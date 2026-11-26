import cron from 'node-cron'
import { listFeeds } from '../lib/feeds/service'
import { refreshFeed } from '../lib/ingest/pipeline'
import { getSchedulerStatus } from '../lib/ingest/diagnostics'

declare global {
  var __womSchedulerStarted: boolean | undefined
  var __womRefreshRunning: boolean | undefined
  var __womCronTask: ReturnType<typeof cron.schedule> | undefined
}

function isDue(
  feed: { updatedAt: string; refreshIntervalMin: number; isDemo: boolean },
  now = Date.now(),
): boolean {
  if (feed.isDemo && process.env.WOM_REFRESH_DEMO !== '1') return false
  const intervalMs = Math.max(5, feed.refreshIntervalMin || 30) * 60_000
  const updated = Date.parse(feed.updatedAt)
  if (!Number.isFinite(updated)) return true
  return now - updated >= intervalMs
}

export async function refreshDueFeeds(opts?: { forceAll?: boolean; limit?: number }) {
  const status = getSchedulerStatus()
  if (global.__womRefreshRunning) {
    return { skipped: true as const, reason: 'already-running' }
  }
  global.__womRefreshRunning = true
  status.running = true
  status.lastTickAt = new Date().toISOString()
  status.totalTicks += 1

  try {
    const feeds = listFeeds()
    const due = opts?.forceAll
      ? feeds.filter((f) => !f.isDemo || process.env.WOM_REFRESH_DEMO === '1')
      : feeds.filter((f) => isDue(f))

    const limit = opts?.limit ?? 8
    const batch = due.slice(0, limit)
    const results = []
    let failures = 0

    for (const feed of batch) {
      try {
        const result = await refreshFeed(feed.id, { trigger: 'scheduler' })
        results.push({ feedId: feed.id, title: feed.title, ...result })
        if (result.errors.length > 0) failures += 1
      } catch (err) {
        failures += 1
        results.push({
          feedId: feed.id,
          title: feed.title,
          error: err instanceof Error ? err.message : 'refresh failed',
        })
      }
    }

    status.lastResultAt = new Date().toISOString()
    status.lastResultSummary = `refreshed ${results.length}/${due.length} due · failures ${failures}`
    if (failures > 0 && results.length > 0 && failures === results.length) {
      status.consecutiveFailures += 1
    } else {
      status.consecutiveFailures = 0
    }

    return { skipped: false as const, due: due.length, results }
  } catch (err) {
    status.consecutiveFailures += 1
    status.lastResultAt = new Date().toISOString()
    status.lastResultSummary = err instanceof Error ? err.message : 'scheduler tick failed'
    throw err
  } finally {
    global.__womRefreshRunning = false
    status.running = false
  }
}

/** In-process scheduler: node-cron when available, setInterval fallback. */
export function ensureScheduler() {
  if (global.__womSchedulerStarted) return
  if (process.env.WOM_DISABLE_SCHEDULER === '1') {
    const status = getSchedulerStatus()
    status.disabled = true
    return
  }
  global.__womSchedulerStarted = true
  const status = getSchedulerStatus()
  status.started = true
  status.disabled = false

  const minutes = Math.max(5, Number(process.env.WOM_REFRESH_MINUTES || 30))
  status.intervalMinutes = minutes

  // Cron every N minutes (aligned to clock); also run an initial delayed tick.
  const expr = `*/${minutes} * * * *`
  if (cron.validate(expr)) {
    global.__womCronTask = cron.schedule(expr, () => {
      void refreshDueFeeds()
    })
  } else {
    setInterval(() => {
      void refreshDueFeeds()
    }, minutes * 60_000)
  }

  // Warm-up tick after boot (avoid competing with seed)
  setTimeout(() => {
    void refreshDueFeeds()
  }, 15_000)
}

export function stopScheduler() {
  global.__womCronTask?.stop()
  global.__womCronTask = undefined
  global.__womSchedulerStarted = false
  const status = getSchedulerStatus()
  status.started = false
}
