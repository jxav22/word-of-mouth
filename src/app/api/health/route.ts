import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { healthPayload } from '@/lib/feeds/service'
import { getSchedulerStatus } from '@/lib/ingest/diagnostics'
import { listAdapters } from '@/lib/sources/registry'

export const dynamic = 'force-dynamic'

export async function GET() {
  await bootstrap()
  return NextResponse.json({
    ...healthPayload(),
    scheduler: getSchedulerStatus(),
    adapters: listAdapters(),
  })
}
