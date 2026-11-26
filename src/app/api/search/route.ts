import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { searchAll } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  await bootstrap()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const feedId = searchParams.get('feedId') || undefined
  if (q.trim().length < 2) {
    return NextResponse.json({ error: 'q min 2 chars' }, { status: 400 })
  }
  return NextResponse.json({ results: searchAll(q, feedId) })
}
