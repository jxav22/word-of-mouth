export type IngestRunRecord = {
  id: string
  startedAt: string
  finishedAt?: string
  trigger: 'scheduler' | 'manual' | 'create' | 'source'
  feedId?: string
  sourceId?: string
  ingested?: number
  ranked?: number
  errors?: string[]
  error?: string
  durationMs?: number
}

export type SchedulerStatus = {
  started: boolean
  disabled: boolean
  intervalMinutes: number
  lastTickAt: string | null
  lastResultAt: string | null
  lastResultSummary: string | null
  running: boolean
  consecutiveFailures: number
  totalTicks: number
}

declare global {
  // eslint-disable-next-line no-var
  var __womIngestRuns: IngestRunRecord[] | undefined
  // eslint-disable-next-line no-var
  var __womSchedulerStatus: SchedulerStatus | undefined
}

const MAX_RUNS = 50

export function getSchedulerStatus(): SchedulerStatus {
  if (!global.__womSchedulerStatus) {
    global.__womSchedulerStatus = {
      started: false,
      disabled: process.env.WOM_DISABLE_SCHEDULER === '1',
      intervalMinutes: Math.max(5, Number(process.env.WOM_REFRESH_MINUTES || 30)),
      lastTickAt: null,
      lastResultAt: null,
      lastResultSummary: null,
      running: false,
      consecutiveFailures: 0,
      totalTicks: 0,
    }
  }
  return global.__womSchedulerStatus
}

export function recordIngestRun(run: IngestRunRecord) {
  if (!global.__womIngestRuns) global.__womIngestRuns = []
  global.__womIngestRuns.unshift(run)
  if (global.__womIngestRuns.length > MAX_RUNS) {
    global.__womIngestRuns.length = MAX_RUNS
  }
}

export function updateIngestRun(id: string, patch: Partial<IngestRunRecord>) {
  const runs = global.__womIngestRuns || []
  const idx = runs.findIndex((r) => r.id === id)
  if (idx >= 0) {
    runs[idx] = { ...runs[idx], ...patch }
  }
}

export function listIngestRuns(limit = 20): IngestRunRecord[] {
  return (global.__womIngestRuns || []).slice(0, limit)
}
