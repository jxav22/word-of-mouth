import { NextResponse } from 'next/server'
import { parseFeedQuery } from '@/lib/feeds/parse'

export const dynamic = 'force-dynamic'

/** Dry-run NL → feed config (no persist). Useful for create-flow quality checks. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { query?: string; title?: string }
    if (!body.query || typeof body.query !== 'string' || body.query.trim().length < 3) {
      return NextResponse.json({ error: 'query is required (min 3 chars)' }, { status: 400 })
    }
    const parsed = parseFeedQuery(body.query, body.title)
    return NextResponse.json({
      parsed,
      ok: parsed.configQuality >= 0.35,
      hint:
        parsed.configQuality < 0.35
          ? 'Add topics, places, or quoted phrases to improve match quality.'
          : parsed.configQuality < 0.55
            ? 'Decent config — consider exclusions (not X) to cut noise.'
            : 'Strong config for ranking and source discovery.',
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Parse failed' },
      { status: 400 },
    )
  }
}
