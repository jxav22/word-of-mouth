import { listFeeds } from '../lib/feeds/service'
import { refreshFeed } from '../lib/ingest/pipeline'

declare global {
  var __womSchedulerStarted: boolean | undefined
  var __womRefreshRunning: boolean | undefined
}

export async function refreshDueFeeds() {
  if (global.__womRefreshRunning) return { skipped: true }
  global.__womRefreshRunning = true
  try {
    const feeds = listFeeds().filter((f) => !f.isDemo || process.env.WOM_REFRESH_DEMO === '1')
    const results = []
    for (const feed of feeds.slice(0, 8)) {
      try {
        const result = await refreshFeed(feed.id)
        results.push({ feedId: feed.id, ...result })
      } catch (err) {
        results.push({
          feedId: feed.id,
          error: err instanceof Error ? err.message : 'refresh failed',
        })
      }
    }
    return { skipped: false, results }
  } finally {
    global.__womRefreshRunning = false
  }
}

/** In-process interval scheduler (fine for single-node demo). */
export function ensureScheduler() {
  if (global.__womSchedulerStarted) return
  if (process.env.WOM_DISABLE_SCHEDULER === '1') return
  global.__womSchedulerStarted = true
  const minutes = Number(process.env.WOM_REFRESH_MINUTES || 30)
  const ms = Math.max(5, minutes) * 60_000
  setInterval(() => {
    void refreshDueFeeds()
  }, ms)
}
