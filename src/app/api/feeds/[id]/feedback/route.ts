import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { getFeedByIdOrSlug, setFeedback } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: Request, ctx: Ctx) {
  await bootstrap()
  const { id } = await ctx.params
  const feed = getFeedByIdOrSlug(id)
  if (!feed) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const body = (await req.json()) as { itemId?: string; vote?: 'up' | 'down' | null }
    if (!body.itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 })
    if (body.vote !== 'up' && body.vote !== 'down' && body.vote !== null) {
      return NextResponse.json({ error: 'vote must be up|down|null' }, { status: 400 })
    }
    setFeedback(feed.id, body.itemId, body.vote)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Feedback failed' },
      { status: 400 },
    )
  }
}
