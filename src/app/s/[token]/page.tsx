import { notFound } from 'next/navigation'
import { FeedSearch } from '@/components/FeedSearch'
import { ModeBadge } from '@/components/ModeBadge'
import { bootstrap } from '@/lib/bootstrap'
import { getFeedByShareToken, getFeedItems } from '@/lib/feeds/service'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ token: string }> }

export default async function SharedFeedPage({ params }: Props) {
  await bootstrap()
  const { token } = await params
  const feed = getFeedByShareToken(token)
  if (!feed) notFound()
  const items = getFeedItems(feed.id)

  return (
    <div className="animate-rise space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge">Shared feed</span>
          <ModeBadge demo={feed.isDemo} size="md" />
        </div>
        <h1 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">{feed.title}</h1>
        <p className="max-w-2xl text-[var(--ink-soft)]">{feed.query}</p>
        <p className="section-label">{items.length} ranked items · read-only share</p>
      </div>
      <FeedSearch feedSlug={feed.slug} items={items} />
    </div>
  )
}
