export function ModeBadge({
  demo,
  size = 'sm',
}: {
  demo: boolean
  size?: 'sm' | 'md'
}) {
  return (
    <span
      className={`badge ${demo ? 'badge-demo' : 'badge-live'} ${size === 'md' ? 'badge-md' : ''}`}
      title={demo ? 'Seeded demo content — not live-fetched' : 'Live sources — RSS / HN'}
    >
      <span className="badge-dot" aria-hidden />
      {demo ? 'Demo' : 'Live'}
    </span>
  )
}
