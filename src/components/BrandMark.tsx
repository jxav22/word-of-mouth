import Link from 'next/link'

export function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-baseline gap-3 no-underline">
      <span
        className={`font-display tracking-tight text-[var(--ink)] group-hover:text-[var(--moss)] transition-colors ${
          large ? 'text-5xl sm:text-7xl leading-none' : 'text-2xl leading-none'
        }`}
      >
        Word of Mouth
      </span>
      {!large && (
        <span className="hidden sm:inline text-[0.65rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]/70">
          listening post
        </span>
      )}
    </Link>
  )
}
