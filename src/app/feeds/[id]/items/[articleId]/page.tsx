import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ItemActions } from '@/components/ItemActions'
import { bootstrap } from '@/lib/bootstrap'
import { ensureShareToken, getArticleForFeed, getFeedByIdOrSlug } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string; articleId: string }> }

export default async function ItemDetailPage({ params }: Props) {
  await bootstrap()
  const { id, articleId } = await params
  const feed = getFeedByIdOrSlug(id)
  if (!feed) notFound()
  const item = getArticleForFeed(feed.id, articleId)
  if (!item) notFound()
  const shareToken = ensureShareToken(feed.id)
  const a = item.article

  return (
    <article className="max-w-3xl space-y-6 animate-rise">
      <Link href={`/feeds/${feed.slug}`} className="text-sm text-[var(--moss)]">
        ← {feed.title}
      </Link>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className={`badge ${a.isDemo ? 'badge-demo' : 'badge-live'}`}>
            {a.isDemo ? 'Demo item' : 'Live item'}
          </span>
          <span className="badge">{a.sourceTitle}</span>
          <span className="badge">score {(item.score * 100).toFixed(0)}</span>
        </div>
        <h1 className="font-display text-4xl text-[var(--ink)] leading-tight">{a.title}</h1>
        <p className="text-sm text-[var(--ink-soft)]">
          {a.author ? `${a.author} · ` : ''}
          {a.publishedAt ? new Date(a.publishedAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' }) + ' NZDT' : 'undated'}
        </p>
      </div>

      <div className="panel p-5 space-y-3">
        <h2 className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">Summary</h2>
        <p className="text-lg leading-relaxed text-[var(--ink)]">{a.summary}</p>
        {a.summaryAttribution ? (
          <p className="text-xs text-[var(--ink-soft)]">{a.summaryAttribution}</p>
        ) : null}
        {a.clusterId ? (
          <p className="text-xs text-[var(--ink-soft)]">Story cluster · {a.clusterId}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <h2 className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">Why ranked</h2>
        <p className="text-sm text-[var(--ink-soft)]">{item.reasons.join(' · ')}</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">Extract</h2>
        <p className="text-[var(--ink-soft)] leading-relaxed whitespace-pre-wrap">{a.contentText}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <a
          href={a.canonicalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 bg-[var(--ink)] text-[var(--paper)] text-sm hover:bg-[var(--moss)]"
        >
          Open original source
        </a>
        <ItemActions
          feedId={feed.id}
          itemId={item.id}
          initial={item.feedback}
          sharePath={`/s/${shareToken}`}
        />
      </div>
    </article>
  )
}
