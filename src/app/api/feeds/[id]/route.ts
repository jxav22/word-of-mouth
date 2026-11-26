import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { getFeedByIdOrSlug, getFeedItems, listSources, patchFeed } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, ctx: Ctx) {
  await bootstrap()
  const { id } = await ctx.params
  const feed = getFeedByIdOrSlug(id)
  if (!feed) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const items = getFeedItems(feed.id)
  const sources = listSources(feed.id)
  return NextResponse.json({ feed, items, sources })
}

export async function PATCH(req: Request, ctx: Ctx) {
  await bootstrap()
  const { id } = await ctx.params
  const feed = getFeedByIdOrSlug(id)
  if (!feed) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const body = (await req.json()) as {
      keywords?: string[]
      excludeKeywords?: string[]
      relevanceThreshold?: number
      title?: string
    }
    const updated = patchFeed(feed.id, body)
    return NextResponse.json({ feed: updated })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Patch failed' },
      { status: 400 },
    )
  }
}
