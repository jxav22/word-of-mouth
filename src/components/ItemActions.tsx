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
  const [note, setNote] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function send(next: 'up' | 'down') {
    const value = vote === next ? null : next
    setVote(value)
    setNote(value === 'up' ? 'Marked useful — threshold nudged up' : value === 'down' ? 'Marked noisy — threshold nudged down' : 'Feedback cleared')
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
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => send('up')}
          className={`px-3 py-1.5 text-xs border border-[var(--line)] transition-colors ${
            vote === 'up' ? 'bg-[var(--teal)] text-white border-transparent' : 'bg-white/60 hover:bg-white'
          }`}
          aria-pressed={vote === 'up'}
          aria-label="Mark useful"
        >
          ▲ Useful
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => send('down')}
          className={`px-3 py-1.5 text-xs border border-[var(--line)] transition-colors ${
            vote === 'down' ? 'bg-[var(--ember-deep)] text-white border-transparent' : 'bg-white/60 hover:bg-white'
          }`}
          aria-pressed={vote === 'down'}
          aria-label="Mark noisy"
        >
          ▼ Noisy
        </button>
        {sharePath && (
          <button type="button" onClick={copyShare} className="btn-outline !py-1.5 !text-xs">
            {copied ? 'Copied' : 'Copy share link'}
          </button>
        )}
      </div>
      {note && <p className="text-xs text-[var(--ink-muted)]">{note}</p>}
    </div>
  )
}
