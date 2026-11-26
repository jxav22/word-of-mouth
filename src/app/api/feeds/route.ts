import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { createFeed, listFeeds } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  await bootstrap()
  return NextResponse.json({ feeds: listFeeds() })
}

export async function POST(req: Request) {
  await bootstrap()
  try {
    const body = (await req.json()) as { query?: string; title?: string; ingest?: boolean }
    if (!body.query || typeof body.query !== 'string' || body.query.trim().length < 3) {
      return NextResponse.json({ error: 'query is required (min 3 chars)' }, { status: 400 })
    }
    const result = await createFeed({
      query: body.query,
      title: body.title,
      ingest: body.ingest,
    })
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create feed' },
      { status: 500 },
    )
  }
}
