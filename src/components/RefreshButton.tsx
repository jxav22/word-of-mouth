'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function RefreshButton({ feedId }: { feedId: string }) {
  const router = useRouter()
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        className="px-3 py-1.5 text-sm border border-[var(--line)] bg-white/70 hover:bg-white disabled:opacity-60"
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
      {msg && <span className="text-xs text-[var(--ink-soft)]">{msg}</span>}
    </div>
  )
}
