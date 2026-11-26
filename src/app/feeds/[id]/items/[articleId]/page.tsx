import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ItemActions } from '@/components/ItemActions'
import { ModeBadge } from '@/components/ModeBadge'
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
    <article className="animate-rise mx-auto max-w-3xl space-y-6">
      <Link href={`/feeds/${feed.slug}`} className="text-sm text-[var(--teal)] hover:underline">
        ← {feed.title}
      </Link>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <ModeBadge demo={a.isDemo} size="md" />
          <span className="badge">{a.sourceTitle}</span>
          <span className="badge">score {(item.score * 100).toFixed(0)}</span>
        </div>
        <h1 className="font-display text-3xl leading-tight text-[var(--ink)] sm:text-4xl">{a.title}</h1>
        <p className="text-sm text-[var(--ink-muted)]">
          {a.author ? `${a.author} · ` : ''}
          {a.publishedAt
            ? new Date(a.publishedAt).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' }) + ' NZDT'
            : 'undated'}
        </p>
      </div>

      <div className="space-y-2 border-l-2 border-[var(--ember)] pl-4">
        <h2 className="section-label">Summary</h2>
        <p className="text-lg leading-relaxed text-[var(--ink)]">{a.summary}</p>
        {a.summaryAttribution ? (
          <p className="text-xs text-[var(--ink-soft)]">{a.summaryAttribution}</p>
        ) : null}
        {a.clusterId ? (
          <p className="text-xs text-[var(--ink-soft)]">Story cluster · {a.clusterId}</p>
        ) : null}
      </div>

      <details className="group">
        <summary className="section-label cursor-pointer hover:text-[var(--teal)] [&::-webkit-details-marker]:hidden">
          Why ranked · {item.reasons.length} signals
        </summary>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.reasons.join(' · ')}</p>
      </details>

      <details className="group" open>
        <summary className="section-label cursor-pointer hover:text-[var(--teal)] [&::-webkit-details-marker]:hidden">
          Extract
        </summary>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--ink-soft)]">{a.contentText}</p>
      </details>

      <div className="flex flex-wrap items-start gap-4 border-t border-[var(--line)] pt-4">
        <a
          href={a.canonicalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ink"
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
