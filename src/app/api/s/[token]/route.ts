import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { getFeedByShareToken, getFeedItems, listSources } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ token: string }> }

export async function GET(_req: Request, ctx: Ctx) {
  await bootstrap()
  const { token } = await ctx.params
  const feed = getFeedByShareToken(token)
  if (!feed) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    feed,
    items: getFeedItems(feed.id),
    sources: listSources(feed.id),
  })
}
