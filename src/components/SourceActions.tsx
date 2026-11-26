'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function SourceActions({
  sourceId,
  enabled,
}: {
  sourceId: string
  enabled: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function run(action: () => Promise<void>) {
    setError(null)
    startTransition(async () => {
      try {
        await action()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed')
      }
    })
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        type="button"
        disabled={pending}
        className="text-xs underline disabled:opacity-50"
        onClick={() =>
          run(async () => {
            const res = await fetch(`/api/sources/${sourceId}/refresh`, { method: 'POST' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Refresh failed')
          })
        }
      >
        Refresh
      </button>
      <button
        type="button"
        disabled={pending}
        className="text-xs underline disabled:opacity-50"
        onClick={() =>
          run(async () => {
            const res = await fetch(`/api/sources/${sourceId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ enabled: !enabled }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Update failed')
          })
        }
      >
        {enabled ? 'Disable' : 'Enable'}
      </button>
      <button
        type="button"
        disabled={pending}
        className="text-xs underline text-red-700 disabled:opacity-50"
        onClick={() =>
          run(async () => {
            if (!confirm('Delete this source?')) return
            const res = await fetch(`/api/sources/${sourceId}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Delete failed')
          })
        }
      >
        Delete
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  )
}
