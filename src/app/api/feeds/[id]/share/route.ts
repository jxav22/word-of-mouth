import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { ensureShareToken, getFeedByIdOrSlug } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: Request, ctx: Ctx) {
  await bootstrap()
  const { id } = await ctx.params
  const feed = getFeedByIdOrSlug(id)
  if (!feed) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const token = ensureShareToken(feed.id)
  const origin = new URL(req.url).origin
  return NextResponse.json({
    token,
    path: `/s/${token}`,
    url: `${origin}/s/${token}`,
  })
}
