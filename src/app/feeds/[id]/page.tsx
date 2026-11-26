import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FeedSearch } from '@/components/FeedSearch'
import { ModeBadge } from '@/components/ModeBadge'
import { RefreshButton } from '@/components/RefreshButton'
import { ShareButton } from '@/components/ShareButton'
import { SourceWarningsBanner } from '@/components/SourceWarningsBanner'
import { bootstrap } from '@/lib/bootstrap'
import { ensureShareToken, getFeedByIdOrSlug, getFeedItems, listSources } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string; warnings?: string }>
}

export default async function FeedDetailPage({ params, searchParams }: Props) {
  await bootstrap()
  const { id } = await params
  const sp = await searchParams
  const feed = getFeedByIdOrSlug(id)
  if (!feed) notFound()
  const items = getFeedItems(feed.id)
  const sources = listSources(feed.id)
  const shareToken = ensureShareToken(feed.id)
  const ok = sources.filter((s) => s.status === 'ok').length
  const errSources = sources.filter((s) => s.status === 'error')
  const justCreated = sp.created === '1'
  const warnings = errSources.map((s) => ({
    title: s.title,
    kind: s.kind,
    message: s.lastError || 'Fetch failed',
  }))

  return (
    <div className="space-y-8">
      <div className="animate-rise space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <ModeBadge demo={feed.isDemo} size="md" />
          {feed.topics.slice(0, 4).map((t) => (
            <span key={t} className="badge">
              {t}
            </span>
          ))}
        </div>
        <h1 className="font-display text-3xl leading-tight text-[var(--ink)] sm:text-5xl">{feed.title}</h1>
        <p className="max-w-3xl text-[var(--ink-soft)]">{feed.query}</p>
        {justCreated && warnings.length === 0 ? (
          <p className="text-sm text-[var(--teal)]" role="status">
            Feed created · {ok} source{ok === 1 ? '' : 's'} healthy · {items.length} ranked items
          </p>
        ) : null}
        {warnings.length > 0 ? (
          <SourceWarningsBanner warnings={warnings} justCreated={justCreated} diagnosticsHref="/sources" />
        ) : null}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <RefreshButton feedId={feed.id} />
          <ShareButton path={`/s/${shareToken}`} />
          <Link href="/sources" className="text-sm text-[var(--teal)] hover:underline">
            Source diagnostics →
          </Link>
        </div>
        <details className="group max-w-2xl">
          <summary className="section-label cursor-pointer list-none hover:text-[var(--teal)] [&::-webkit-details-marker]:hidden">
            <span className="underline-offset-2 group-open:underline">Keywords &amp; threshold</span>
            <span className="ml-2 text-[var(--ink-muted)]">
              {(feed.relevanceThreshold * 100).toFixed(0)}% · {feed.keywords.length} keywords
              {feed.excludeKeywords?.length ? ` · ${feed.excludeKeywords.length} excludes` : ''}
            </span>
          </summary>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{feed.keywords.join(', ') || '—'}</p>
          {feed.excludeKeywords?.length ? (
            <p className="mt-1 text-xs text-[var(--ink-muted)]">
              Exclude: {feed.excludeKeywords.join(', ')}
            </p>
          ) : null}
        </details>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1fr_240px]">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-2xl">Ranked items</h2>
            <p className="section-label">{items.length} items</p>
          </div>
          <FeedSearch feedSlug={feed.slug} items={items} />
        </div>
        <aside className="h-fit space-y-3 border-t border-[var(--line)] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="section-label">Sources</h3>
            <span className="text-[0.68rem] text-[var(--ink-muted)]">
              {ok} ok{errSources.length > 0 ? ` · ${errSources.length} err` : ''}
            </span>
          </div>
          <ul className="space-y-3">
            {sources.map((s) => (
              <li key={s.id} className="text-sm">
                <div className="font-medium text-[var(--ink)]">{s.title}</div>
                <div
                  className={`text-xs ${s.status === 'ok' ? 'status-ok' : s.status === 'error' ? 'status-error' : 'status-pending'}`}
                >
                  {s.kind} · {s.status}
                </div>
                {s.lastError && <div className="mt-1 text-xs text-red-700">{s.lastError}</div>}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  )
}
