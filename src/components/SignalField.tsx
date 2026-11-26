/** Full-bleed visual plane: murmur / signal waves behind the hero brand. */
export function SignalField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="absolute right-[-8%] top-[8%] h-[78%] w-[72%] opacity-90"
        viewBox="0 0 640 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="wave-path"
          d="M40 260 C120 120, 200 400, 280 260 S440 120, 520 260 640 400, 700 260"
          stroke="rgba(238,243,240,0.22)"
          strokeWidth="1.5"
        />
        <path
          className="wave-path"
          style={{ animationDelay: '0.25s' }}
          d="M20 290 C110 170, 190 410, 290 290 S450 150, 540 290 660 420, 720 290"
          stroke="rgba(42,154,136,0.45)"
          strokeWidth="1.75"
        />
        <path
          className="wave-path"
          style={{ animationDelay: '0.5s' }}
          d="M0 320 C100 210, 180 430, 300 320 S470 180, 560 320 680 440, 740 320"
          stroke="rgba(217,119,47,0.38)"
          strokeWidth="1.5"
        />
        <circle cx="280" cy="260" r="4" fill="rgba(238,243,240,0.55)" />
        <circle cx="520" cy="260" r="3" fill="rgba(42,154,136,0.7)" />
        <circle cx="400" cy="200" r="2.5" fill="rgba(217,119,47,0.65)" />
      </svg>

      <div className="absolute left-[6%] top-[28%] flex w-[28%] max-w-[220px] flex-col gap-3 opacity-50">
        <div className="murmur-line h-px w-full bg-[rgba(238,243,240,0.45)]" />
        <div className="murmur-line h-px w-[82%] bg-[rgba(42,154,136,0.55)]" />
        <div className="murmur-line h-px w-[64%] bg-[rgba(238,243,240,0.35)]" />
        <div className="murmur-line h-px w-[90%] bg-[rgba(217,119,47,0.4)]" />
      </div>
    </div>
  )
}
