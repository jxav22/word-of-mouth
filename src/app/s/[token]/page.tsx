import { notFound } from 'next/navigation'
import { FeedSearch } from '@/components/FeedSearch'
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
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="badge">Shared feed</span>
        <h1 className="font-display text-4xl text-[var(--ink)]">{feed.title}</h1>
        <p className="text-[var(--ink-soft)]">{feed.query}</p>
        <span className={`badge ${feed.isDemo ? 'badge-demo' : 'badge-live'}`}>
          {feed.isDemo ? 'Demo' : 'Live'}
        </span>
      </div>
      <FeedSearch feedSlug={feed.slug} items={items} />
    </div>
  )
}
