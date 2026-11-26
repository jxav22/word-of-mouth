import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { addSource, listSources } from '@/lib/feeds/service'
import { listAdapters } from '@/lib/sources/registry'
import { getSchedulerStatus, listIngestRuns } from '@/lib/ingest/diagnostics'
import type { SourceKind } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  await bootstrap()
  const url = new URL(req.url)
  const feedId = url.searchParams.get('feedId') || undefined
  const sources = listSources(feedId)
  const summary = {
    total: sources.length,
    ok: sources.filter((s) => s.status === 'ok').length,
    error: sources.filter((s) => s.status === 'error').length,
    pending: sources.filter((s) => s.status === 'pending').length,
    disabled: sources.filter((s) => s.enabled === false).length,
  }
  return NextResponse.json({
    summary,
    sources,
    adapters: listAdapters(),
    scheduler: getSchedulerStatus(),
    recentRuns: listIngestRuns(15),
  })
}

export async function POST(req: Request) {
  await bootstrap()
  try {
    const body = (await req.json()) as {
      feedId?: string
      kind?: SourceKind
      url?: string
      title?: string
      ingest?: boolean
    }
    if (!body.feedId || !body.kind || !body.url) {
      return NextResponse.json({ error: 'feedId, kind, and url are required' }, { status: 400 })
    }
    const result = await addSource({
      feedId: body.feedId,
      kind: body.kind,
      url: body.url,
      title: body.title || body.kind,
      ingest: body.ingest,
    })
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to add source' },
      { status: 400 },
    )
  }
}
