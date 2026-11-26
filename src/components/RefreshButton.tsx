'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function RefreshButton({ feedId }: { feedId: string }) {
  const router = useRouter()
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        className="btn-outline"
        onClick={() => {
          setMsg(null)
          startTransition(async () => {
            const res = await fetch(`/api/feeds/${feedId}/refresh`, { method: 'POST' })
            const data = await res.json()
            if (!res.ok) {
              setMsg(data.error || 'Refresh failed')
              return
            }
            setMsg(`Ingested ${data.ingested}, ranked ${data.ranked}`)
            router.refresh()
          })
        }}
      >
        {pending ? 'Refreshing…' : 'Refresh now'}
      </button>
      {msg && <span className="text-xs text-[var(--ink-muted)]">{msg}</span>}
    </div>
  )
}
