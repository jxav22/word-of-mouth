import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { listSources } from '@/lib/feeds/service'
import { listAdapters } from '@/lib/sources/registry'
import { getSchedulerStatus, listIngestRuns } from '@/lib/ingest/diagnostics'
import { refreshDueFeeds } from '@/workers/scheduler'

export const dynamic = 'force-dynamic'

export async function GET() {
  await bootstrap()
  const sources = listSources()
  return NextResponse.json({
    scheduler: getSchedulerStatus(),
    adapters: listAdapters(),
    recentRuns: listIngestRuns(20),
    sources: {
      total: sources.length,
      ok: sources.filter((s) => s.status === 'ok').length,
      error: sources.filter((s) => s.status === 'error').length,
      pending: sources.filter((s) => s.status === 'pending').length,
      disabled: sources.filter((s) => s.enabled === false).length,
      failing: sources.filter((s) => (s.consecutiveFailures || 0) >= 3),
    },
  })
}

/** Manual scheduler tick — useful for ops / diagnostics UI. */
export async function POST(req: Request) {
  await bootstrap()
  const body = (await req.json().catch(() => ({}))) as { forceAll?: boolean; limit?: number }
  const result = await refreshDueFeeds({ forceAll: body.forceAll, limit: body.limit })
  return NextResponse.json({
    scheduler: getSchedulerStatus(),
    ...result,
  })
}
