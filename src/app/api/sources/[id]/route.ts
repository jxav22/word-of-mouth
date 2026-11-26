import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { deleteSource, getSource, updateSource } from '@/lib/feeds/service'
import type { SourceKind } from '@/lib/types'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, ctx: Ctx) {
  await bootstrap()
  const { id } = await ctx.params
  const source = getSource(id)
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ source })
}

export async function PATCH(req: Request, ctx: Ctx) {
  await bootstrap()
  const { id } = await ctx.params
  try {
    const body = (await req.json()) as {
      title?: string
      url?: string
      enabled?: boolean
      kind?: SourceKind
    }
    const source = updateSource(id, body)
    return NextResponse.json({ source })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed'
    const status = message === 'Source not found' ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  await bootstrap()
  const { id } = await ctx.params
  try {
    deleteSource(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    const status = message === 'Source not found' ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
