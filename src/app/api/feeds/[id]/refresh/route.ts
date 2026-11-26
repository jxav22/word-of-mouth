import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { getFeedByIdOrSlug } from '@/lib/feeds/service'
import { refreshFeed } from '@/lib/ingest/pipeline'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_req: Request, ctx: Ctx) {
  await bootstrap()
  const { id } = await ctx.params
  const feed = getFeedByIdOrSlug(id)
  if (!feed) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const result = await refreshFeed(feed.id)
    return NextResponse.json({ feedId: feed.id, ...result })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Refresh failed' },
      { status: 500 },
    )
  }
}
