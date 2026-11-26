import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FeedSearch } from '@/components/FeedSearch'
import { RefreshButton } from '@/components/RefreshButton'
import { ShareButton } from '@/components/ShareButton'
import { bootstrap } from '@/lib/bootstrap'
import { ensureShareToken, getFeedByIdOrSlug, getFeedItems, listSources } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function FeedDetailPage({ params }: Props) {
  await bootstrap()
  const { id } = await params
  const feed = getFeedByIdOrSlug(id)
  if (!feed) notFound()
  const items = getFeedItems(feed.id)
  const sources = listSources(feed.id)
  const shareToken = ensureShareToken(feed.id)

  return (
    <div className="space-y-8">
      <div className="space-y-3 animate-rise">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge ${feed.isDemo ? 'badge-demo' : 'badge-live'}`}>
            {feed.isDemo ? 'Demo feed' : 'Live feed'}
          </span>
          {feed.topics.map((t) => (
            <span key={t} className="badge">
              {t}
            </span>
          ))}
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-[var(--ink)]">{feed.title}</h1>
        <p className="max-w-3xl text-[var(--ink-soft)]">{feed.query}</p>
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <RefreshButton feedId={feed.id} />
          <ShareButton path={`/s/${shareToken}`} />
          <Link href="/sources" className="text-sm text-[var(--moss)]">
            Source diagnostics →
          </Link>
        </div>
        <p className="text-xs text-[var(--ink-soft)]">
          Keywords: {feed.keywords.join(', ')}
          {feed.excludeKeywords?.length ? ` · exclude: ${feed.excludeKeywords.join(', ')}` : ''}
          {' · '}
          threshold {(feed.relevanceThreshold * 100).toFixed(0)}%
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <h2 className="font-display text-2xl">Ranked items</h2>
          <FeedSearch feedSlug={feed.slug} items={items} />
        </div>
        <aside className="panel p-4 h-fit space-y-3">
          <h3 className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">Sources</h3>
          <ul className="space-y-3">
            {sources.map((s) => (
              <li key={s.id} className="text-sm">
                <div className="font-medium text-[var(--ink)]">{s.title}</div>
                <div className="text-xs text-[var(--ink-soft)] break-all">{s.kind} · {s.status}</div>
                {s.lastError && <div className="text-xs text-red-700 mt-1">{s.lastError}</div>}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  )
}
