'use client'

import { useState } from 'react'

export function ShareButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className={`btn-outline ${copied ? '!border-[var(--teal)] !text-[var(--teal)]' : ''}`}
      aria-live="polite"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}${path}`)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          setCopied(false)
        }
      }}
    >
      {copied ? 'Link copied ✓' : 'Copy share link'}
    </button>
  )
}
