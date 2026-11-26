'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function SchedulerControls({
  status,
}: {
  status: {
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
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div className="border border-[var(--line)] bg-white/50 p-4 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl text-[var(--ink)]">Scheduler</h2>
        <button
          type="button"
          disabled={pending || status.running}
          className="text-sm underline disabled:opacity-50"
          onClick={() =>
            startTransition(async () => {
              setMessage(null)
              const res = await fetch('/api/ingest/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forceAll: false }),
              })
              const data = await res.json()
              setMessage(
                data.skipped
                  ? `Skipped: ${data.reason || 'busy'}`
                  : `Tick complete · ${data.results?.length ?? 0} feeds`,
              )
              router.refresh()
            })
          }
        >
          {status.running || pending ? 'Running…' : 'Run due feeds now'}
        </button>
      </div>
      <p className="text-sm text-[var(--ink-soft)]">
        {status.disabled
          ? 'Disabled (WOM_DISABLE_SCHEDULER=1)'
          : status.started
            ? `Active · every ${status.intervalMinutes}m · ${status.totalTicks} ticks`
            : 'Not started'}
        {status.consecutiveFailures > 0 ? ` · ${status.consecutiveFailures} consecutive failures` : ''}
      </p>
      {status.lastResultSummary && (
        <p className="text-sm text-[var(--ink)]">{status.lastResultSummary}</p>
      )}
      {status.lastTickAt && (
        <p className="text-xs text-[var(--ink-soft)]">
          Last tick:{' '}
          {new Date(status.lastTickAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })} NZDT
        </p>
      )}
      {message && <p className="text-sm text-emerald-800">{message}</p>}
    </div>
  )
}
