import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { getSource } from '@/lib/feeds/service'
import { refreshSource } from '@/lib/ingest/pipeline'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_req: Request, ctx: Ctx) {
  await bootstrap()
  const { id } = await ctx.params
  const source = getSource(id)
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const result = await refreshSource(id)
    return NextResponse.json({ source: getSource(id), ...result })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Refresh failed' },
      { status: 500 },
    )
  }
}
