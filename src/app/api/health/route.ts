import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { healthPayload } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  await bootstrap()
  return NextResponse.json(healthPayload())
}
