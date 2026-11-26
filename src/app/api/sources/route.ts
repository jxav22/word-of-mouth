import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { listSources } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  await bootstrap()
  const feedId = new URL(req.url).searchParams.get('feedId') || undefined
  const sources = listSources(feedId)
  const summary = {
    total: sources.length,
    ok: sources.filter((s) => s.status === 'ok').length,
    error: sources.filter((s) => s.status === 'error').length,
    pending: sources.filter((s) => s.status === 'pending').length,
  }
  return NextResponse.json({ summary, sources })
}
