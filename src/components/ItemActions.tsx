'use client'

import { useState, useTransition } from 'react'

export function ItemActions({
  feedId,
  itemId,
  initial,
  sharePath,
}: {
  feedId: string
  itemId: string
  initial?: 'up' | 'down' | null
  sharePath?: string
}) {
  const [vote, setVote] = useState<'up' | 'down' | null>(initial ?? null)
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()

  function send(next: 'up' | 'down') {
    const value = vote === next ? null : next
    setVote(value)
    startTransition(async () => {
      await fetch(`/api/feeds/${feedId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, vote: value }),
      })
    })
  }

  async function copyShare() {
    if (!sharePath) return
    const url = `${window.location.origin}${sharePath}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => send('up')}
        className={`px-2.5 py-1 text-xs border border-[var(--line)] ${
          vote === 'up' ? 'bg-[var(--moss)] text-white' : 'bg-white/60'
        }`}
        aria-label="Thumbs up"
      >
        ▲ Useful
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => send('down')}
        className={`px-2.5 py-1 text-xs border border-[var(--line)] ${
          vote === 'down' ? 'bg-[var(--amber-deep)] text-white' : 'bg-white/60'
        }`}
        aria-label="Thumbs down"
      >
        ▼ Noisy
      </button>
      {sharePath && (
        <button
          type="button"
          onClick={copyShare}
          className="px-2.5 py-1 text-xs border border-[var(--line)] bg-white/60"
        >
          {copied ? 'Copied' : 'Copy share link'}
        </button>
      )}
    </div>
  )
}
