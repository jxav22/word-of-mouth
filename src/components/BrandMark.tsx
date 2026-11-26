import Link from 'next/link'

export function BrandMark({
  large = false,
  inverted = false,
}: {
  large?: boolean
  inverted?: boolean
}) {
  const tone = inverted ? 'text-[var(--hero-mist)] group-hover:text-white' : 'text-[var(--ink)] group-hover:text-[var(--teal)]'

  return (
    <Link href="/" className="brand-mark group inline-flex items-baseline gap-3 no-underline">
      <span
        className={`font-display tracking-tight transition-colors ${tone} ${
          large
            ? 'text-[clamp(2.75rem,10vw,5.75rem)] leading-[0.92]'
            : 'text-xl sm:text-2xl leading-none'
        }`}
      >
        Word of Mouth
      </span>
      {!large && (
        <span
          className={`hidden sm:inline text-[0.62rem] uppercase tracking-[0.2em] ${
            inverted ? 'text-[var(--hero-muted)]' : 'text-[var(--ink-muted)]'
          }`}
        >
          listening post
        </span>
      )}
    </Link>
  )
}
