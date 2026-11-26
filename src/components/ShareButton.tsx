'use client'

import { useState } from 'react'

export function ShareButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="px-3 py-1.5 text-sm border border-[var(--line)] bg-white/70 hover:bg-white"
      onClick={async () => {
        await navigator.clipboard.writeText(`${window.location.origin}${path}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? 'Link copied' : 'Copy share link'}
    </button>
  )
}
